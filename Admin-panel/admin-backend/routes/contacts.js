const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createTransporter, normalizeString } = require('../services/mailer');

const router = express.Router();

const toContact = (contact) => {
  const resolved = normalizeString(contact.status).toLowerCase() === 'resolved';
  return {
    _id: contact._id,
    requesterName: normalizeString(contact.fullName) || normalizeString(contact.name) || 'Contact User',
    requesterEmail: normalizeString(contact.emailAddress) || normalizeString(contact.email) || 'N/A',
    requesterPhone: normalizeString(contact.phoneNumber) || normalizeString(contact.phone) || 'N/A',
    subject: normalizeString(contact.subject) || 'Contact Us Message',
    message:
      normalizeString(contact.yourMessage) ||
      normalizeString(contact.message) ||
      normalizeString(contact.description) ||
      'Contact form submission',
    status: resolved ? 'resolved' : 'pending',
    adminReply: normalizeString(contact.adminReply) || '',
    adminReplySentAt: contact.adminReplySentAt || null,
    createdAt: contact.createdAt || contact.updatedAt || new Date(),
    updatedAt: contact.updatedAt || contact.createdAt || new Date()
  };
};

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const searchText = normalizeString(search).toLowerCase();

    const collection = mongoose.connection.db.collection('contacts');
    const docs = await collection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
    const mapped = docs.map(toContact);

    const filtered = mapped.filter((item) => {
      if (status && item.status !== status) return false;
      if (!searchText) return true;
      return (
        String(item.subject || '').toLowerCase().includes(searchText) ||
        String(item.message || '').toLowerCase().includes(searchText) ||
        String(item.requesterName || '').toLowerCase().includes(searchText) ||
        String(item.requesterEmail || '').toLowerCase().includes(searchText)
      );
    });

    return res.json({
      contacts: filtered,
      pagination: {
        current: 1,
        total: 1,
        count: filtered.length
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const collection = mongoose.connection.db.collection('contacts');
    const total = await collection.countDocuments({});
    const resolved = await collection.countDocuments({ status: 'resolved' });
    const pending = total - resolved;
    return res.json({ totalContacts: total, statusBreakdown: { pending, resolved } });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    const collection = mongoose.connection.db.collection('contacts');
    const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    return res.json(toContact(doc));
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
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
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const collection = mongoose.connection.db.collection('contacts');
      const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
      if (!doc) return res.status(404).json({ message: 'Contact not found' });

      const requesterEmail = normalizeString(doc.emailAddress) || normalizeString(doc.email);
      const requesterName = normalizeString(doc.fullName) || normalizeString(doc.name) || 'User';
      const requestSubject = normalizeString(doc.subject) || 'Contact Us Message';
      const replyMessage = normalizeString(req.body.replyMessage);
      const now = new Date();

      if (!requesterEmail) return res.status(400).json({ message: 'Requester email is missing for this contact' });

      const mailSubject = `Re: ${requestSubject}`;
      const textBody = `Hi ${requesterName},\n\n${replyMessage}\n\nThanks,\nEasyPG Admin Team`;
      const htmlBody = `<p>Hi ${requesterName},</p><p>${replyMessage.replace(/\n/g, '<br/>')}</p><p>Thanks,<br/>EasyPG Admin Team</p>`;

      const { transporter, from, error } = createTransporter();
      if (!transporter) {
        return res.status(500).json({ message: error || 'SMTP not configured. Contact reply cannot be sent.' });
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
        return res.status(502).json({ message: `Email delivery failed: ${sendError.message}` });
      }

      const updated = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        {
          $set: {
            adminReply: replyMessage,
            adminReplySentAt: now,
            adminReplySentBy: req.user?._id || req.user?.id || null,
            status: 'resolved',
            updatedAt: now
          }
        },
        { returnDocument: 'after' }
      );

      const updatedDoc = updated?.value || updated;
      const finalDoc =
        updatedDoc ||
        (await collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) }));
      if (!finalDoc) {
        return res.status(500).json({ message: 'Reply sent but failed to load updated contact' });
      }

      return res.json({ message: 'Reply sent successfully', contact: toContact(finalDoc) });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to send reply', error: error.message });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    const collection = mongoose.connection.db.collection('contacts');
    const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ message: 'Contact not found' });
    return res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
