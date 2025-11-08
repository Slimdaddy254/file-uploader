const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all folders (root level) or specific folder with subfolders
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const folderId = req.query.folder;

    let currentFolder = null;
    let breadcrumbs = [];

    if (folderId) {
      currentFolder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: req.user.id,
        },
      });

      if (!currentFolder) {
        req.flash('error_msg', 'Folder not found');
        return res.redirect('/folders');
      }

      // Build breadcrumbs
      let folder = currentFolder;
      breadcrumbs.unshift({ id: folder.id, name: folder.name });
      while (folder.parentId) {
        folder = await prisma.folder.findUnique({
          where: { id: folder.parentId },
        });
        breadcrumbs.unshift({ id: folder.id, name: folder.name });
      }
    }

    // Get folders
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: folderId || null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get files in current folder
    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: folderId || null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.render('folders/index', {
      folders,
      files,
      currentFolder,
      breadcrumbs,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/');
  }
});

// Create folder
router.post(
  '/',
  ensureAuthenticated,
  [body('name').trim().notEmpty().withMessage('Folder name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect('back');
    }

    try {
      const { name, parentId } = req.body;

      // Check if parent folder exists and belongs to user
      if (parentId) {
        const parentFolder = await prisma.folder.findFirst({
          where: {
            id: parentId,
            userId: req.user.id,
          },
        });

        if (!parentFolder) {
          req.flash('error_msg', 'Parent folder not found');
          return res.redirect('/folders');
        }
      }

      await prisma.folder.create({
        data: {
          name,
          userId: req.user.id,
          parentId: parentId || null,
        },
      });

      req.flash('success_msg', 'Folder created successfully');
      res.redirect(parentId ? `/folders?folder=${parentId}` : '/folders');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'An error occurred while creating folder');
      res.redirect('back');
    }
  }
);

// Get edit folder page
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      req.flash('error_msg', 'Folder not found');
      return res.redirect('/folders');
    }

    res.render('folders/edit', { folder });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/folders');
  }
});

// Update folder
router.put(
  '/:id',
  ensureAuthenticated,
  [body('name').trim().notEmpty().withMessage('Folder name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect('back');
    }

    try {
      const folder = await prisma.folder.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!folder) {
        req.flash('error_msg', 'Folder not found');
        return res.redirect('/folders');
      }

      await prisma.folder.update({
        where: { id: req.params.id },
        data: { name: req.body.name },
      });

      req.flash('success_msg', 'Folder updated successfully');
      res.redirect(folder.parentId ? `/folders?folder=${folder.parentId}` : '/folders');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'An error occurred while updating folder');
      res.redirect('back');
    }
  }
);

// Delete folder
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      req.flash('error_msg', 'Folder not found');
      return res.redirect('/folders');
    }

    // Delete all files in folder (Cloudinary cleanup would happen here)
    const files = await prisma.file.findMany({
      where: { folderId: folder.id },
    });

    const cloudinary = require('../config/cloudinary');
    for (const file of files) {
      try {
        await cloudinary.uploader.destroy(file.publicId);
      } catch (err) {
        console.error('Error deleting file from Cloudinary:', err);
      }
    }

    // Delete folder (cascade will handle subfolders and files)
    await prisma.folder.delete({
      where: { id: req.params.id },
    });

    req.flash('success_msg', 'Folder deleted successfully');
    res.redirect(folder.parentId ? `/folders?folder=${folder.parentId}` : '/folders');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while deleting folder');
    res.redirect('back');
  }
});

module.exports = router;
