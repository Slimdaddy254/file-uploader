const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const streamifier = require('stream').Readable;

const prisma = new PrismaClient();

// Upload file page
router.get('/upload', ensureAuthenticated, async (req, res) => {
  const folderId = req.query.folder;
  let currentFolder = null;

  if (folderId) {
    currentFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });
  }

  res.render('files/upload', { currentFolder });
});

// Handle file upload
router.post('/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'Please select a file to upload');
      return res.redirect('back');
    }

    const { folderId } = req.body;

    // Verify folder belongs to user if specified
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: req.user.id,
        },
      });

      if (!folder) {
        req.flash('error_msg', 'Folder not found');
        return res.redirect('/folders');
      }
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'file-uploader',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.from(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    // Save file info to database
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: result.secure_url,
        publicId: result.public_id,
        userId: req.user.id,
        folderId: folderId || null,
      },
    });

    req.flash('success_msg', 'File uploaded successfully');
    res.redirect(folderId ? `/folders?folder=${folderId}` : '/folders');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', err.message || 'An error occurred while uploading file');
    res.redirect('back');
  }
});

// View file details
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        folder: true,
      },
    });

    if (!file) {
      req.flash('error_msg', 'File not found');
      return res.redirect('/folders');
    }

    res.render('files/details', { file });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/folders');
  }
});

// Download file
router.get('/:id/download', ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!file) {
      req.flash('error_msg', 'File not found');
      return res.redirect('/folders');
    }

    // Redirect to Cloudinary URL with download flag
    const downloadUrl = cloudinary.url(file.publicId, {
      flags: 'attachment',
      resource_type: 'auto',
    });

    res.redirect(downloadUrl);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while downloading file');
    res.redirect('back');
  }
});

// Delete file
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!file) {
      req.flash('error_msg', 'File not found');
      return res.redirect('/folders');
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.publicId, { resource_type: 'auto' });
    } catch (err) {
      console.error('Error deleting file from Cloudinary:', err);
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: req.params.id },
    });

    req.flash('success_msg', 'File deleted successfully');
    res.redirect(file.folderId ? `/folders?folder=${file.folderId}` : '/folders');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while deleting file');
    res.redirect('back');
  }
});

module.exports = router;
