const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../middleware/auth');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Create share link for folder
router.post('/:folderId', ensureAuthenticated, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { duration } = req.body; // e.g., "1d", "7d", "30d"

    // Verify folder belongs to user
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

    // Parse duration
    const durationMatch = duration.match(/^(\d+)d$/);
    if (!durationMatch) {
      req.flash('error_msg', 'Invalid duration format. Use format like "1d", "7d", etc.');
      return res.redirect('back');
    }

    const days = parseInt(durationMatch[1]);
    if (days < 1 || days > 365) {
      req.flash('error_msg', 'Duration must be between 1 and 365 days');
      return res.redirect('back');
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Create shared link
    const sharedLink = await prisma.sharedLink.create({
      data: {
        token,
        folderId,
        expiresAt,
      },
    });

    // Generate shareable URL
    const shareUrl = `${req.protocol}://${req.get('host')}/share/${token}`;

    res.render('share/created', { shareUrl, expiresAt, folder });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while creating share link');
    res.redirect('back');
  }
});

// View shared folder (public access)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find shared link
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: {
        folder: {
          include: {
            files: true,
            subfolders: true,
          },
        },
      },
    });

    if (!sharedLink) {
      return res.status(404).render('error', { error: 'Shared link not found' });
    }

    // Check if link has expired
    if (new Date() > sharedLink.expiresAt) {
      return res.status(410).render('error', { error: 'This shared link has expired' });
    }

    // Get all files in folder and subfolders recursively
    const getAllFiles = async (folderId) => {
      const files = await prisma.file.findMany({
        where: { folderId },
      });

      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
      });

      let allFiles = [...files];
      for (const subfolder of subfolders) {
        const subFiles = await getAllFiles(subfolder.id);
        allFiles = [...allFiles, ...subFiles];
      }

      return allFiles;
    };

    const allFiles = await getAllFiles(sharedLink.folder.id);

    res.render('share/view', {
      folder: sharedLink.folder,
      files: allFiles,
      expiresAt: sharedLink.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'An error occurred' });
  }
});

// Delete share link
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { id: req.params.id },
      include: { folder: true },
    });

    if (!sharedLink) {
      req.flash('error_msg', 'Share link not found');
      return res.redirect('/folders');
    }

    // Verify folder belongs to user
    if (sharedLink.folder.userId !== req.user.id) {
      req.flash('error_msg', 'Unauthorized');
      return res.redirect('/folders');
    }

    await prisma.sharedLink.delete({
      where: { id: req.params.id },
    });

    req.flash('success_msg', 'Share link deleted successfully');
    res.redirect(`/folders?folder=${sharedLink.folderId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('back');
  }
});

// List share links for a folder
router.get('/folder/:folderId/links', ensureAuthenticated, async (req, res) => {
  try {
    const { folderId } = req.params;

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

    const sharedLinks = await prisma.sharedLink.findMany({
      where: { folderId },
      orderBy: { createdAt: 'desc' },
    });

    res.render('share/list', { folder, sharedLinks, host: req.get('host'), protocol: req.protocol });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('back');
  }
});

module.exports = router;
