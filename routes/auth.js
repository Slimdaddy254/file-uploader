const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { forwardAuthenticated } = require('../middleware/auth');

const prisma = new PrismaClient();

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('auth/login');
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('auth/register');
});

// Register Handle
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email,
      });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { username }],
        },
      });

      if (existingUser) {
        return res.render('auth/register', {
          errors: [{ msg: 'Email or username already exists' }],
          username,
          email,
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('auth/register', {
        errors: [{ msg: 'An error occurred during registration' }],
        username,
        email,
      });
    }
  }
);

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/folders',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
});

module.exports = router;
