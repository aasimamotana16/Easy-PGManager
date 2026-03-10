const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const EasyPGUser = require('../models/EasyPGUser');

const router = express.Router();
const ADMIN_EMAIL_DOMAIN = 'gmail.com';
const LEGACY_ADMIN_EMAIL_DOMAINS = ['easymanger.com', 'easymanager.com'];
const RESET_TOKEN_EXPIRE_MINUTES = Number(process.env.RESET_TOKEN_EXPIRE_MINUTES || '15');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const normalizeAdminEmail = (email = '') => {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned.includes('@')) return cleaned;
  const local = cleaned.split('@')[0] || 'admin';
  return `${local}@${ADMIN_EMAIL_DOMAIN}`;
};

const buildUsernameFromEmail = (email = '') => {
  const local = email.split('@')[0] || 'admin';
  const cleaned = local.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return cleaned || 'admin';
};

const ensureAdminAccount = async (sourceUser, secret) => {
  const email = sourceUser.email?.toLowerCase();
  const preferredUsername = sourceUser.username || sourceUser.fullName || sourceUser.name || buildUsernameFromEmail(email);
  const normalizedUsername = preferredUsername.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '') || buildUsernameFromEmail(email);

  let adminUser = await User.findOne({ email });
  if (adminUser) {
    adminUser.username = adminUser.username || normalizedUsername;
    adminUser.password = secret;
    adminUser.role = 'admin';
    adminUser.isActive = true;
    await adminUser.save();
    return adminUser;
  }

  let candidate = normalizedUsername;
  let suffix = 1;
  while (await User.exists({ username: candidate })) {
    candidate = `${normalizedUsername}${suffix}`;
    suffix += 1;
  }

  adminUser = await User.create({
    username: candidate,
    email,
    password: secret,
    role: 'admin',
    isActive: true
  });

  return adminUser;
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const getMailerConfig = () => {
  const portValue = Number(process.env.SMTP_PORT || '587');
  return {
    host: normalizeString(process.env.SMTP_HOST),
    port: Number.isFinite(portValue) ? portValue : 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: normalizeString(process.env.SMTP_USER),
    pass: normalizeString(process.env.SMTP_PASS),
    from: normalizeString(process.env.SMTP_FROM) || normalizeString(process.env.SMTP_USER)
  };
};

const createTransporter = () => {
  let nodemailer = null;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    return { transporter: null, error: 'Missing nodemailer dependency. Run: npm install nodemailer (inside admin-backend).' };
  }

  const mailer = getMailerConfig();
  if (!mailer.host || !mailer.user || !mailer.pass || !mailer.from) {
    return {
      transporter: null,
      error: 'SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM.'
    };
  }

  return {
    transporter: nodemailer.createTransport({
      host: mailer.host,
      port: mailer.port,
      secure: mailer.secure,
      auth: {
        user: mailer.user,
        pass: mailer.pass
      }
    }),
    from: mailer.from,
    error: null
  };
};

const buildResetUrl = (resetToken) => {
  const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();
  const sanitized = frontendBase.replace(/\/+$/, '');
  return `${sanitized}/login?mode=reset&token=${encodeURIComponent(resetToken)}`;
};

router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('adminSecretKey').isLength({ min: 6 }).withMessage('Admin secret key must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be admin or staff')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, adminSecretKey, role = 'staff' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({
      username,
      email,
      password: adminSecretKey,
      role
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', loginLimiter, [
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('username').optional().trim().notEmpty().withMessage('Username is required'),
  body('adminSecretKey').optional().notEmpty().withMessage('Admin secret key required'),
  body('password').optional().notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      username,
      adminSecretKey,
      password
    } = req.body;

    const rawNormalizedEmail = email?.trim().toLowerCase();
    const normalizedEmail = rawNormalizedEmail ? normalizeAdminEmail(rawNormalizedEmail) : undefined;
    const inputEmailDomain = rawNormalizedEmail?.split('@')[1];
    const localPart = rawNormalizedEmail?.split('@')[0];
    const emailCandidates = normalizedEmail
      ? [
          normalizedEmail,
          ...LEGACY_ADMIN_EMAIL_DOMAINS.map((domain) => `${localPart}@${domain}`)
        ]
      : [];
    const normalizedUsername = username?.trim();
    const secret = (adminSecretKey ?? password ?? '').trim();

    if ((!normalizedEmail && !normalizedUsername) || !secret) {
      return res.status(400).json({
        message: 'Email or username and password are required'
      });
    }

    // Admin login accepts only gmail.com as input domain.
    if (rawNormalizedEmail && inputEmailDomain !== ADMIN_EMAIL_DOMAIN) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const userQuery = { isActive: true };
    const emailCondition = { email: { $in: emailCandidates } };

    if (normalizedEmail && normalizedUsername) {
      userQuery.$or = [emailCondition, { username: normalizedUsername }];
    } else if (normalizedEmail) {
      Object.assign(userQuery, emailCondition);
    } else {
      userQuery.username = normalizedUsername;
    }

    let user = await User.findOne(userQuery);
    let isMatch = false;

    if (user) {
      isMatch = await user.comparePassword(secret);
      if (isMatch && normalizedEmail && user.email !== normalizedEmail) {
        user.email = normalizedEmail;
        await user.save();
      }
    }

    // Fallback: allow EasyPG Manager admin users and migrate them to admin_users.
    if (!user || !isMatch) {
      if (!normalizedEmail) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const easyPgAdminUser = await EasyPGUser.findOne({
        email: { $in: emailCandidates },
        role: 'admin'
      });

      if (!easyPgAdminUser) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const easyPgMatch = await easyPgAdminUser.matchPassword(secret);
      if (!easyPgMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      user = await ensureAdminAccount({
        ...(easyPgAdminUser.toObject ? easyPgAdminUser.toObject() : easyPgAdminUser),
        email: normalizedEmail
      }, secret);
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', loginLimiter, [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rawNormalizedEmail = req.body.email?.trim().toLowerCase();
    const inputEmailDomain = rawNormalizedEmail?.split('@')[1];
    const localPart = rawNormalizedEmail?.split('@')[0];

    if (inputEmailDomain !== ADMIN_EMAIL_DOMAIN) {
      return res.json({
        message: 'If an account exists for this email, a reset link has been sent.'
      });
    }

    const normalizedEmail = normalizeAdminEmail(rawNormalizedEmail);
    const emailCandidates = [
      normalizedEmail,
      ...LEGACY_ADMIN_EMAIL_DOMAINS.map((domain) => `${localPart}@${domain}`)
    ];

    const user = await User.findOne({
      email: { $in: emailCandidates },
      isActive: true
    });

    if (!user) {
      return res.json({
        message: 'If an account exists for this email, a reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expireMinutes = Number.isFinite(RESET_TOKEN_EXPIRE_MINUTES) ? RESET_TOKEN_EXPIRE_MINUTES : 15;

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + expireMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = buildResetUrl(resetToken);
    const { transporter, from } = createTransporter();

    if (!transporter) {
      return res.json({
        message: 'Reset token generated. SMTP not configured, use preview link.',
        previewResetLink: resetUrl
      });
    }

    try {
      await transporter.sendMail({
        from,
        to: user.email,
        subject: 'EasyPG Admin password reset',
        text:
          `You requested a password reset.\n\n` +
          `Use this link to reset your password:\n${resetUrl}\n\n` +
          `This link expires in ${expireMinutes} minutes.\n\n` +
          'If you did not request this, you can ignore this email.',
        html:
          '<p>You requested a password reset.</p>' +
          `<p><a href="${resetUrl}">Reset your password</a></p>` +
          `<p>This link expires in ${expireMinutes} minutes.</p>` +
          '<p>If you did not request this, you can ignore this email.</p>'
      });
    } catch (sendError) {
      return res.json({
        message: `Email delivery failed (${sendError.message}). Use preview link.`,
        previewResetLink: resetUrl
      });
    }

    return res.json({
      message: 'If an account exists for this email, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', loginLimiter, [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(req.body.token.trim())
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: new Date() },
      isActive: true
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.newPassword.trim();
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
