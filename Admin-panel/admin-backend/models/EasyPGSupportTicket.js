const mongoose = require('mongoose');

// Match your EasyPG Manager SupportTicket model exactly
const supportTicketSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', required: true },
  ticketId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  date: { type: String, required: true },
  yourName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  phone: { type: String, required: true },
  adminReply: { type: String, default: '' },
  adminReplySentAt: { type: Date },
  adminReplySentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'supporttickets'
});

// Indexes for better performance
supportTicketSchema.index({ ownerId: 1 });
supportTicketSchema.index({ status: 1 });

module.exports = mongoose.models.EasyPGSupportTicket || mongoose.model('EasyPGSupportTicket', supportTicketSchema);
