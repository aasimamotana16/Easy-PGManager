const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const EasyPGSupportTicket = require('../models/EasyPGSupportTicket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const getMailerConfig = () => {
  const portValue = Number(process.env.SMTP_PORT || '587');
  return {
    host: '',
    port: Number.isFinite(portValue) ? portValue : 587,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: '',
    pass: '',
    from: ''
  };
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const buildMailtoUrl = (to, subject, body) =>
  `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const createTransporter = () => {
  let nodemailer = null;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    return { transporter: null, error: 'Missing nodemailer dependency. Run: npm install nodemailer (inside admin-backend).' };
  }

  const mailer = getMailerConfig();
  mailer.host = normalizeString(process.env.SMTP_HOST);
  mailer.user = normalizeString(process.env.SMTP_USER);
  mailer.pass = normalizeString(process.env.SMTP_PASS);
  mailer.from = normalizeString(process.env.SMTP_FROM) || mailer.user;

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

const toRequest = (ticket) => ({
  _id: ticket._id,
  requestType: 'support_ticket',
  requesterName: ticket.yourName,
  requesterEmail: ticket.emailAddress,
  requesterPhone: ticket.phone,
  subject: ticket.subject,
  description: ticket.description,
  priority: 'medium',
  requestStatus: ticket.status === 'Open' ? 'pending' : ticket.status === 'In Progress' ? 'in_progress' : 'resolved',
  assignedTo: null,
  resolution: '',
  adminReply: normalizeString(ticket.adminReply) || '',
  adminReplySentAt: ticket.adminReplySentAt || null,
  resolvedAt: ticket.status === 'Closed' ? ticket.updatedAt : null,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt
});

const toDemoRequest = (demo) => {
  const requesterName =
    normalizeString(demo.name) ||
    normalizeString(demo.fullName) ||
    normalizeString(demo.userName) ||
    'Demo User';
  const requesterEmail =
    normalizeString(demo.email) ||
    normalizeString(demo.emailAddress) ||
    'N/A';
  const requesterPhone =
    normalizeString(demo.phone) ||
    normalizeString(demo.mobile) ||
    normalizeString(demo.phoneNumber) ||
    'N/A';
  const subject = normalizeString(demo.subject) || 'Free Demo Request';
  const descriptionParts = [
    normalizeString(demo.message),
    normalizeString(demo.notes),
    normalizeString(demo.company),
    normalizeString(demo.city)
  ].filter(Boolean);

  return {
    _id: `demo_${demo._id}`,
    requestType: 'demo_request',
    requesterName,
    requesterEmail,
    requesterPhone,
    subject,
    description: descriptionParts.join(' | ') || 'User requested a free demo.',
    priority: 'medium',
    requestStatus: demo.status === 'resolved' ? 'resolved' : 'pending',
    assignedTo: null,
    resolution: normalizeString(demo.resolution) || '',
    adminReply: normalizeString(demo.adminReply) || '',
    adminReplySentAt: demo.adminReplySentAt || null,
    resolvedAt: demo.status === 'resolved' ? demo.updatedAt || demo.createdAt : null,
    createdAt: demo.createdAt || demo.updatedAt || new Date(),
    updatedAt: demo.updatedAt || demo.createdAt || new Date(),
    source: 'demo_request'
  };
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const currentPage = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const skip = (currentPage - 1) * pageLimit;
    const query = {};

    if (status === 'pending') query.status = 'Open';
    if (status === 'in_progress') query.status = 'In Progress';
    if (status === 'resolved') query.status = 'Closed';

    const tickets = await EasyPGSupportTicket.find(query).sort({ createdAt: -1 }).lean();

    let demoRequests = [];
    try {
      const demoCollection = mongoose.connection.db.collection('demorequests');
      const demoDocs = await demoCollection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
      demoRequests = demoDocs.map(toDemoRequest);
    } catch (error) {
      // Keep support-ticket requests working even if demo collection does not exist.
      demoRequests = [];
    }

    const allRequests = [...tickets.map(toRequest), ...demoRequests];
    const searchText = normalizeString(search).toLowerCase();
    const filtered = allRequests.filter((item) => {
      if (!searchText) return true;
      return (
        String(item.subject || '').toLowerCase().includes(searchText) ||
        String(item.description || '').toLowerCase().includes(searchText) ||
        String(item.requesterName || '').toLowerCase().includes(searchText) ||
        String(item.requesterEmail || '').toLowerCase().includes(searchText)
      );
    });
    const statusFiltered = filtered.filter((item) => !status || item.requestStatus === status);
    statusFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginated = statusFiltered.slice(skip, skip + pageLimit);

    res.json({
      requests: paginated,
      pagination: {
        current: currentPage,
        total: Math.ceil(statusFiltered.length / pageLimit),
        count: statusFiltered.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSupport = await EasyPGSupportTicket.countDocuments({});
    const open = await EasyPGSupportTicket.countDocuments({ status: 'Open' });
    const inProgress = await EasyPGSupportTicket.countDocuments({ status: 'In Progress' });
    const resolvedSupport = await EasyPGSupportTicket.countDocuments({ status: 'Closed' });
    let demoCount = 0;
    let resolvedDemo = 0;

    try {
      const demoCollection = mongoose.connection.db.collection('demorequests');
      demoCount = await demoCollection.countDocuments({});
      resolvedDemo = await demoCollection.countDocuments({ status: 'resolved' });
    } catch (error) {
      demoCount = 0;
      resolvedDemo = 0;
    }

    const totalRequests = totalSupport + demoCount;
    const resolved = resolvedSupport + resolvedDemo;
    const pending = totalRequests - inProgress - resolved;

    res.json({
      totalRequests,
      statusBreakdown: { pending, inProgress, resolved },
      priorityBreakdown: { medium: totalRequests }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (String(req.params.id).startsWith('demo_')) {
      const demoId = req.params.id.replace('demo_', '');
      if (!mongoose.Types.ObjectId.isValid(demoId)) {
        return res.status(404).json({ message: 'Request not found' });
      }
      const demoCollection = mongoose.connection.db.collection('demorequests');
      const demo = await demoCollection.findOne({ _id: new mongoose.Types.ObjectId(demoId) });
      if (!demo) return res.status(404).json({ message: 'Request not found' });
      return res.json(toDemoRequest(demo));
    }

    const ticket = await EasyPGSupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Request not found' });
    res.json(toRequest(ticket));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  [
    authenticateToken,
    body('requesterName').trim().notEmpty().withMessage('Requester name is required'),
    body('requesterEmail').isEmail().withMessage('Valid email required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const ticket = await EasyPGSupportTicket.create({
        ownerId: req.user._id,
        ticketId: `REQ-${Date.now()}`,
        subject: req.body.subject,
        description: req.body.description,
        status: 'Open',
        date: new Date().toISOString().slice(0, 10),
        yourName: req.body.requesterName,
        emailAddress: req.body.requesterEmail,
        phone: req.body.requesterPhone || ''
      });

      res.status(201).json({ message: 'Request submitted successfully', request: toRequest(ticket) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id).startsWith('demo_')) {
      const demoId = req.params.id.replace('demo_', '');
      if (!mongoose.Types.ObjectId.isValid(demoId)) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const updateData = { updatedAt: new Date() };
      if (req.body.requestStatus === 'resolved') {
        updateData.status = 'resolved';
        updateData.resolution = req.body.resolution || '';
      } else {
        updateData.status = 'pending';
      }

      const demoCollection = mongoose.connection.db.collection('demorequests');
      const result = await demoCollection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(demoId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      if (!result.value) return res.status(404).json({ message: 'Request not found' });
      return res.json({ message: 'Request updated successfully', request: toDemoRequest(result.value) });
    }

    const updateData = {};
    if (req.body.requestStatus === 'pending') updateData.status = 'Open';
    if (req.body.requestStatus === 'in_progress') updateData.status = 'In Progress';
    if (req.body.requestStatus === 'resolved' || req.body.requestStatus === 'rejected') updateData.status = 'Closed';

    const ticket = await EasyPGSupportTicket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!ticket) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request updated successfully', request: toRequest(ticket) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/:id/reply',
  [
    authenticateToken,
    requireAdmin,
    body('replyMessage').trim().notEmpty().withMessage('Reply message is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const replyMessage = normalizeString(req.body.replyMessage);
      const now = new Date();
      const subjectPrefix = normalizeString(req.body.subjectPrefix) || 'Re';

      let requesterEmail = '';
      let requesterName = '';
      let requestSubject = '';
      let requestPayload = null;

      if (String(req.params.id).startsWith('demo_')) {
        const demoId = req.params.id.replace('demo_', '');
        if (!mongoose.Types.ObjectId.isValid(demoId)) {
          return res.status(404).json({ message: 'Request not found' });
        }

        const demoCollection = mongoose.connection.db.collection('demorequests');
        const demo = await demoCollection.findOne({ _id: new mongoose.Types.ObjectId(demoId) });
        if (!demo) return res.status(404).json({ message: 'Request not found' });

        requesterEmail = normalizeString(demo.emailAddress) || normalizeString(demo.email);
        requesterName =
          normalizeString(demo.name) ||
          normalizeString(demo.fullName) ||
          normalizeString(demo.userName) ||
          'User';
        requestSubject = normalizeString(demo.subject) || 'Contact Request';

        if (!requesterEmail) return res.status(400).json({ message: 'Requester email is missing for this request' });

        const updatedDemo = await demoCollection.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(demoId) },
          {
            $set: {
              adminReply: replyMessage,
              adminReplySentAt: now,
              adminReplySentBy: req.user?._id || req.user?.id || null,
              updatedAt: now
            }
          },
          { returnDocument: 'after' }
        );
        if (!updatedDemo.value) return res.status(404).json({ message: 'Request not found' });
        requestPayload = toDemoRequest(updatedDemo.value);
      } else {
        const ticket = await EasyPGSupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Request not found' });

        requesterEmail = normalizeString(ticket.emailAddress);
        requesterName = normalizeString(ticket.yourName) || 'User';
        requestSubject = normalizeString(ticket.subject) || 'Support Request';

        if (!requesterEmail) return res.status(400).json({ message: 'Requester email is missing for this request' });

        const updatedTicket = await EasyPGSupportTicket.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              adminReply: replyMessage,
              adminReplySentAt: now,
              adminReplySentBy: req.user?._id || req.user?.id || undefined,
              updatedAt: now
            }
          },
          { new: true, runValidators: true }
        );
        requestPayload = toRequest(updatedTicket);
      }

      const { transporter, from, error } = createTransporter();
      const mailSubject = `${subjectPrefix}: ${requestSubject}`;
      const textBody =
        `Hi ${requesterName},\n\n` +
        `${replyMessage}\n\n` +
        'Thanks,\nEasyPG Admin Team';
      const htmlBody =
        `<p>Hi ${requesterName},</p>` +
        `<p>${replyMessage.replace(/\n/g, '<br/>')}</p>` +
        '<p>Thanks,<br/>EasyPG Admin Team</p>';

      if (!transporter) {
        return res.json({
          message: error || 'SMTP not configured. Opened manual email draft.',
          manual: true,
          mailtoUrl: buildMailtoUrl(requesterEmail, mailSubject, textBody),
          request: requestPayload
        });
      }

      try {
        await transporter.sendMail({
          from,
          to: requesterEmail,
          subject: mailSubject,
          text: textBody,
          html: htmlBody
        });
      } catch (sendError) {
        return res.json({
          message: `Email delivery failed (${sendError.message}). Opened manual email draft.`,
          manual: true,
          mailtoUrl: buildMailtoUrl(requesterEmail, mailSubject, textBody),
          request: requestPayload
        });
      }

      return res.json({
        message: 'Reply sent successfully',
        request: requestPayload
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to send reply', error: error.message });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id).startsWith('demo_')) {
      const demoId = req.params.id.replace('demo_', '');
      if (!mongoose.Types.ObjectId.isValid(demoId)) {
        return res.status(404).json({ message: 'Request not found' });
      }
      const demoCollection = mongoose.connection.db.collection('demorequests');
      const result = await demoCollection.deleteOne({ _id: new mongoose.Types.ObjectId(demoId) });
      if (!result.deletedCount) return res.status(404).json({ message: 'Request not found' });
      return res.json({ message: 'Request deleted successfully' });
    }

    const ticket = await EasyPGSupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
