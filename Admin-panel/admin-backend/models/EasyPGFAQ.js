const mongoose = require('mongoose');

// Flexible schema to stay compatible with existing EasyPG Manager FAQ documents.
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
    collection: 'faqs',
    strict: false
  }
);

faqSchema.index({ question: 'text', answer: 'text', category: 'text' });
faqSchema.index({ isActive: 1 });
faqSchema.index({ displayOrder: 1 });

module.exports = mongoose.models.EasyPGFAQ || mongoose.model('EasyPGFAQ', faqSchema);
