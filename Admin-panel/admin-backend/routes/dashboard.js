const express = require('express');
const EasyPGUser = require('../models/EasyPGUser');
const EasyPGPG = require('../models/EasyPGPG');
const EasyPGSupportTicket = require('../models/EasyPGSupportTicket');
const EasyPGAgreement = require('../models/EasyPGAgreement');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalUsers = await EasyPGUser.countDocuments({ role: { $in: ['user', 'owner', 'admin'] } });
    const totalOwners = await EasyPGUser.countDocuments({ role: 'owner' });
    const totalPGs = await EasyPGPG.countDocuments({ status: 'live' });
    const totalComplaints = await EasyPGSupportTicket.countDocuments({});
    const pendingComplaints = await EasyPGSupportTicket.countDocuments({ status: 'Open' });
    const activeAgreements = await EasyPGAgreement.countDocuments({ signed: true });

    const recentTickets = await EasyPGSupportTicket.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    const recentAgreementsRaw = await EasyPGAgreement.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const recentComplaints = recentTickets.map((t) => ({
      _id: t._id,
      title: t.subject,
      status: t.status === 'Open' ? 'pending' : t.status === 'In Progress' ? 'in-progress' : 'resolved',
      pgId: { name: 'N/A' },
      createdAt: t.createdAt
    }));

    const recentAgreements = recentAgreementsRaw.map((a) => ({
      _id: a._id,
      agreementNumber: a.agreementId,
      tenantName: a.tenantName,
      pg: { name: a.pgName || 'N/A' },
      status: a.signed ? 'active' : 'expired',
      createdAt: a.createdAt
    }));

    res.json({
      dashboardStats: {
        totalUsers,
        totalOwners,
        totalPGs,
        totalComplaints,
        pendingComplaints,
        activeAgreements
      },
      recentComplaints,
      recentAgreements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
