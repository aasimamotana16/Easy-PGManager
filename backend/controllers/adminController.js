const User = require('../models/userModel');
const Pg = require('../models/pgModel');
const SupportTicket = require('../models/supportTicketModel');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const PendingPayment = require('../models/pendingPaymentModel');
const AdminConfig = require('../models/adminConfigModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const DOCUMENT_FIELDS = ['idDocument', 'aadharCard', 'rentalAgreementCopy'];
const PROPERTY_DOCUMENT_FIELDS = ['aadhaar', 'electricityBill', 'propertyTax'];
const PROPERTY_TEMPLATE_FIELDS = [
  { key: 'agreementFileUrl', type: 'property.agreementTemplatePdf' },
  { key: 'ownerSignatureUrl', type: 'property.ownerSignature' }
];
const REQUIRED_PROPERTY_DOCS = ['aadhaar', 'electricityBill', 'propertyTax'];

const getPropertyDocStatus = (pg, key) => {
  return pg?.proofDocumentMeta?.[key]?.status || (pg?.proofDocuments?.[key] ? 'Uploaded' : 'Pending');
};

const getTemplateDocStatus = (pg, key) => {
  return pg?.agreementTemplateMeta?.[key]?.status || (pg?.agreementTemplate?.[key] ? 'Uploaded' : 'Pending');
};

// Existing Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(400).json({ message: 'Invalid admin credentials' });
    
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid admin credentials' });
    
    // Generate Token so the admin stays logged in [cite: 2026-01-06]
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      message: 'Admin login successful', 
      token,
      admin: { id: admin._id, email: admin.email } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: This connects your Admin Dashboard UI
const getAdminDashboardStats = async (req, res) => {
  try {
    const [totalOwners, totalTenants, pendingPaymentsCount, activeComplaints, bookingStats, paymentAgg] = await Promise.all([
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: { $in: ['tenant', 'user'] } }),
      PendingPayment.countDocuments({ status: { $in: ['Pending', 'Overdue'] } }),
      SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            confirmedBookings: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0]
              }
            }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: { $in: ['Success', 'Paid', 'PAID'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amountPaid' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOwners: totalOwners || 0,
        totalTenants: totalTenants || 0,
        pendingPayments: pendingPaymentsCount || 0,
        activeComplaints: activeComplaints || 0,
        totalBookings: bookingStats?.[0]?.totalBookings || 0,
        confirmedBookings: bookingStats?.[0]?.confirmedBookings || 0,
        totalRevenue: paymentAgg?.[0]?.totalRevenue || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// @desc    Add a new user (Owner or Tenant) [cite: 2026-01-06]
const addUser = async (req, res) => {
  const { fullName, email, password, role } = req.body; // camelCase [cite: 2026-01-01]
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'tenant'
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ message: "Error adding user" });
  }
};

// @desc    Update user details [cite: 2026-01-07]
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Update failed" });
  }
};

// @desc    Delete a user [cite: 2026-01-06]
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, message: "User removed" });
  } catch (error) {
    res.status(400).json({ message: "Delete failed" });
  }
};

// @desc    Get all pending properties
const getPendingProperties = async (req, res) => {
  try {
    const pendingProperties = await Pg.find({ status: 'pending' }).populate('ownerId', 'fullName email phone');
    
    res.status(200).json({
      success: true,
      count: pendingProperties.length,
      data: pendingProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending properties' });
  }
};

// @desc    Approve a property
const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Pg.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const missingRequiredDocs = REQUIRED_PROPERTY_DOCS.filter((field) => !property?.proofDocuments?.[field]);
    if (missingRequiredDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Upload required documents first: ${missingRequiredDocs.join(', ')}`
      });
    }

    const unverifiedRequiredDocs = REQUIRED_PROPERTY_DOCS.filter(
      (field) => getPropertyDocStatus(property, field) !== 'Verified'
    );
    if (unverifiedRequiredDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Verify all required documents before confirming PG: ${unverifiedRequiredDocs.join(', ')}`
      });
    }

    const uploadedTemplateKeys = PROPERTY_TEMPLATE_FIELDS
      .map((tpl) => tpl.key)
      .filter((key) => Boolean(property?.agreementTemplate?.[key]));
    const unverifiedUploadedTemplates = uploadedTemplateKeys.filter(
      (key) => getTemplateDocStatus(property, key) !== 'Verified'
    );
    if (unverifiedUploadedTemplates.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Verify uploaded agreement documents before confirming PG"
      });
    }

    // Update status to live
    property.status = 'live';
    property.approvalStatus = 'confirmed';
    await property.save();

    // Get owner details for email
    const owner = await User.findById(property.ownerId);

    // Send email to owner
    const ownerEmail = owner.email;
    
    if (ownerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: ownerEmail,
          subject: `Your Property "${property.pgName}" has been Approved!`,
          html: `
            <h2>Congratulations! Your Property has been Approved</h2>
            <p>Dear ${owner.fullName},</p>
            <p>Your property <strong>${property.pgName}</strong> has been approved and is now live on EasyPG Manager!</p>
            <p>Tenants can now find and book your property.</p>
            <p>Thank you for using EasyPG Manager.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Approval notification email sent to owner:", ownerEmail);
      } catch (emailError) {
        console.error("Error sending email to owner:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving property' });
  }
};

// @desc    Reject a property
const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const property = await Pg.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Update status to rejected
    property.status = 'rejected';
    property.approvalStatus = 'rejected';
    await property.save();

    // No owner email before full approval as per product rule.

    res.status(200).json({
      success: true,
      message: 'Property rejected',
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting property' });
  }
};

// @desc    Get uploaded documents for admin verification queue
const getPendingDocuments = async (req, res) => {
  try {
    const users = await User.find({})
      .select('fullName email role idDocument aadharCard rentalAgreementCopy');
    const properties = await Pg.find({})
      .populate('ownerId', 'fullName email role')
      .select('pgName proofDocuments proofDocumentMeta agreementTemplate agreementTemplateMeta updatedAt createdAt ownerId');

    const queue = [];
    users.forEach((u) => {
      DOCUMENT_FIELDS.forEach((field) => {
        const doc = u[field];
        if (doc && doc.fileUrl && (doc.status === 'Uploaded' || doc.status === 'Rejected')) {
          queue.push({
            userId: u._id,
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            documentType: field,
            status: doc.status,
            fileUrl: doc.fileUrl,
            uploadedAt: doc.uploadedAt || null,
            reviewedAt: doc.reviewedAt || null,
            reviewNote: doc.reviewNote || ''
          });
        }
      });
    });

    properties.forEach((pg) => {
      PROPERTY_DOCUMENT_FIELDS.forEach((field) => {
        const fileUrl = pg?.proofDocuments?.[field];
        if (!fileUrl) return;

        queue.push({
          userId: pg.ownerId?._id || null,
          fullName: pg.ownerId?.fullName || "Unknown Owner",
          email: pg.ownerId?.email || "",
          role: pg.ownerId?.role || "owner",
          propertyId: pg._id,
          propertyName: pg.pgName || "Unknown Property",
          documentType: `property.${field}`,
          status: getPropertyDocStatus(pg, field),
          fileUrl,
          uploadedAt: pg.updatedAt || pg.createdAt || null,
          reviewedAt: pg?.proofDocumentMeta?.[field]?.reviewedAt || null,
          reviewNote: pg?.proofDocumentMeta?.[field]?.reviewNote || '',
          reviewable: true
        });
      });

      PROPERTY_TEMPLATE_FIELDS.forEach((tpl) => {
        const fileUrl = pg?.agreementTemplate?.[tpl.key];
        if (!fileUrl) return;

        queue.push({
          userId: pg.ownerId?._id || null,
          fullName: pg.ownerId?.fullName || "Unknown Owner",
          email: pg.ownerId?.email || "",
          role: pg.ownerId?.role || "owner",
          propertyId: pg._id,
          propertyName: pg.pgName || "Unknown Property",
          documentType: tpl.type,
          status: getTemplateDocStatus(pg, tpl.key),
          fileUrl,
          uploadedAt: pg?.agreementTemplate?.uploadedAt || pg.updatedAt || pg.createdAt || null,
          reviewedAt: pg?.agreementTemplateMeta?.[tpl.key]?.reviewedAt || null,
          reviewNote: pg?.agreementTemplateMeta?.[tpl.key]?.reviewNote || '',
          reviewable: true
        });
      });
    });

    queue.sort((a, b) => {
      const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.status(200).json({
      success: true,
      count: queue.length,
      data: queue
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching pending documents' });
  }
};

// @desc    Review one user document from admin panel
const reviewUserDocument = async (req, res) => {
  try {
    const { userId, propertyId, documentType, status, note } = req.body;

    if (!documentType || !status) {
      return res.status(400).json({ success: false, message: 'documentType and status are required' });
    }
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Verified or Rejected' });
    }

    if (String(documentType || '').startsWith('property.')) {
      const effectivePropertyId = propertyId || userId;
      if (!effectivePropertyId) {
        return res.status(400).json({ success: false, message: 'propertyId is required for property document review' });
      }

      const pg = await Pg.findById(effectivePropertyId);
      if (!pg) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const now = new Date();
      const reviewNote = note || '';

      if (!pg.proofDocumentMeta) pg.proofDocumentMeta = {};
      if (!pg.agreementTemplateMeta) pg.agreementTemplateMeta = {};

      if (documentType === 'property.aadhaar' || documentType === 'property.electricityBill' || documentType === 'property.propertyTax') {
        const field = documentType.replace('property.', '');
        if (!pg?.proofDocuments?.[field]) {
          return res.status(404).json({ success: false, message: 'Property document not found' });
        }
        pg.proofDocumentMeta[field] = { status, reviewedAt: now, reviewNote };
      } else if (documentType === 'property.agreementTemplatePdf') {
        if (!pg?.agreementTemplate?.agreementFileUrl) {
          return res.status(404).json({ success: false, message: 'Agreement template PDF not found' });
        }
        pg.agreementTemplateMeta.agreementFileUrl = { status, reviewedAt: now, reviewNote };
      } else if (documentType === 'property.ownerSignature') {
        if (!pg?.agreementTemplate?.ownerSignatureUrl) {
          return res.status(404).json({ success: false, message: 'Owner signature not found' });
        }
        pg.agreementTemplateMeta.ownerSignatureUrl = { status, reviewedAt: now, reviewNote };
      } else {
        return res.status(400).json({ success: false, message: 'Invalid property documentType' });
      }

      await pg.save();

      return res.status(200).json({
        success: true,
        message: `Property document ${status.toLowerCase()} successfully`,
        data: { propertyId: pg._id, documentType, status, reviewedAt: now, reviewNote }
      });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required for user document review' });
    }
    if (!DOCUMENT_FIELDS.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid documentType' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user[documentType] || !user[documentType].fileUrl) {
      return res.status(404).json({ success: false, message: 'Document not found for this user' });
    }

    user[documentType].status = status;
    user[documentType].reviewedAt = new Date();
    user[documentType].reviewNote = note || '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Document ${status.toLowerCase()} successfully`,
      data: {
        userId: user._id,
        documentType,
        status: user[documentType].status,
        reviewedAt: user[documentType].reviewedAt,
        reviewNote: user[documentType].reviewNote
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error reviewing document' });
  }
};

// @desc    Get all support tickets (owner/user) for admin panel
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching support tickets' });
  }
};

// @desc    Update support ticket status from admin panel
const updateSupportTicketByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['Open', 'In Progress', 'Closed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating support ticket' });
  }
};

// @desc    Booking + Payment overview for admin panel
const getBookingPaymentOverview = async (req, res) => {
  try {
    const [bookings, payments, pendingPayments] = await Promise.all([
      Booking.find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .select('bookingId pgName tenantName tenantEmail status ownerApproved isPaid paymentStatus checkInDate checkOutDate createdAt'),
      Payment.find({ paymentStatus: { $in: ['Success', 'Paid', 'PAID'] } })
        .sort({ paymentDate: -1 })
        .limit(200)
        .select('pgName tenantName amountPaid month paymentDate transactionId'),
      PendingPayment.find({ status: { $in: ['Pending', 'Overdue'] } })
        .sort({ dueDate: 1 })
        .limit(200)
        .select('pgName tenantName amount dueDate status month')
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        payments,
        pendingPayments
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching booking/payment overview' });
  }
};

const getOrCreateAdminConfig = async () => {
  let config = await AdminConfig.findOne({ key: "global" });
  if (!config) {
    config = await AdminConfig.create({ key: "global" });
  }
  return config;
};

const getAgreementSettings = async (req, res) => {
  try {
    const config = await getOrCreateAdminConfig();
    return res.status(200).json({
      success: true,
      data: config.agreementSettings || {}
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching agreement settings" });
  }
};

const updateAgreementSettings = async (req, res) => {
  try {
    const { templateVersion, fixedClauses, jurisdiction, platformDisclaimer, esignConsentText } = req.body || {};
    const config = await getOrCreateAdminConfig();

    config.agreementSettings = {
      templateVersion: String(templateVersion || config.agreementSettings?.templateVersion || "v1"),
      fixedClauses: Array.isArray(fixedClauses)
        ? fixedClauses.map((clause) => String(clause || "").trim()).filter(Boolean)
        : (config.agreementSettings?.fixedClauses || []),
      jurisdiction: String(jurisdiction ?? config.agreementSettings?.jurisdiction ?? "").trim(),
      platformDisclaimer: String(platformDisclaimer ?? config.agreementSettings?.platformDisclaimer ?? "").trim(),
      esignConsentText: String(esignConsentText ?? config.agreementSettings?.esignConsentText ?? "").trim()
    };
    config.updatedByAdmin = req.user?._id || null;

    await config.save();

    return res.status(200).json({
      success: true,
      message: "Agreement settings updated successfully",
      data: config.agreementSettings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating agreement settings" });
  }
};

const getPricingRules = async (req, res) => {
  try {
    const config = await getOrCreateAdminConfig();
    return res.status(200).json({
      success: true,
      data: config.pricingRules || {}
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching pricing rules" });
  }
};

const updatePricingRules = async (req, res) => {
  try {
    const { allowDepositPerVariant, depositModesAllowed, maxDepositMonths, minDepositRequired } = req.body || {};
    const config = await getOrCreateAdminConfig();

    const safeModes = Array.isArray(depositModesAllowed)
      ? depositModesAllowed.filter((mode) => ["fixed", "months_rent"].includes(String(mode)))
      : config.pricingRules?.depositModesAllowed || ["fixed", "months_rent"];

    config.pricingRules = {
      allowDepositPerVariant: allowDepositPerVariant !== undefined
        ? Boolean(allowDepositPerVariant)
        : Boolean(config.pricingRules?.allowDepositPerVariant ?? true),
      depositModesAllowed: safeModes.length > 0 ? safeModes : ["fixed", "months_rent"],
      maxDepositMonths: Number.isFinite(Number(maxDepositMonths))
        ? Math.max(0, Math.min(12, Number(maxDepositMonths)))
        : Number(config.pricingRules?.maxDepositMonths ?? 3),
      minDepositRequired: minDepositRequired !== undefined
        ? Boolean(minDepositRequired)
        : Boolean(config.pricingRules?.minDepositRequired ?? true)
    };
    config.updatedByAdmin = req.user?._id || null;

    await config.save();

    return res.status(200).json({
      success: true,
      message: "Pricing rules updated successfully",
      data: config.pricingRules
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating pricing rules" });
  }
};

module.exports = { 
  adminLogin, 
  getAdminDashboardStats, 
  addUser, 
  updateUser, 
  deleteUser,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getPendingDocuments,
  reviewUserDocument,
  getSupportTickets,
  updateSupportTicketByAdmin,
  getBookingPaymentOverview,
  getAgreementSettings,
  updateAgreementSettings,
  getPricingRules,
  updatePricingRules
};
