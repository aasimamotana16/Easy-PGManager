const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    externalId: { type: String, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', default: null },
    userName: { type: String, trim: true },
    userRole: { type: String, trim: true },
    comment: { type: String, trim: true },
    isVisible: { type: Boolean, default: undefined },
    reviewerName: { type: String, trim: true, default: '' },
    reviewerRole: { type: String, trim: true, default: '' },
    userTypeLabel: { type: String, default: 'Verified User', trim: true },
    quote: { type: String, trim: true, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    avatarInitial: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'reviews'
  }
);

reviewSchema.index({ isActive: 1, displayOrder: 1, createdAt: -1 });
reviewSchema.index({ externalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
