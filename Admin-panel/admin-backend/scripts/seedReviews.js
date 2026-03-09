const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('../models/Review');

dotenv.config();

const seedData = [
  {
    externalId: 's1',
    reviewerName: 'Student',
    reviewerRole: 'student',
    userTypeLabel: 'Verified User',
    quote: 'EasyPG made finding a PG effortless.',
    rating: 5,
    avatarInitial: 'S',
    displayOrder: 1,
    isActive: true
  },
  {
    externalId: 's2',
    reviewerName: 'Owner',
    reviewerRole: 'owner',
    userTypeLabel: 'Verified User',
    quote: 'Great platform for owners.',
    rating: 5,
    avatarInitial: 'O',
    displayOrder: 2,
    isActive: true
  },
  {
    externalId: 's3',
    reviewerName: 'Tenant',
    reviewerRole: 'tenant',
    userTypeLabel: 'Verified User',
    quote: 'Smooth booking flow and transparent pricing.',
    rating: 5,
    avatarInitial: 'T',
    displayOrder: 3,
    isActive: true
  },
  {
    externalId: 's4',
    reviewerName: 'Tenant',
    reviewerRole: 'tenant',
    userTypeLabel: 'Verified User',
    quote: 'Helpful support and quick responses.',
    rating: 5,
    avatarInitial: 'T',
    displayOrder: 4,
    isActive: true
  },
  {
    externalId: 's5',
    reviewerName: 'Student',
    reviewerRole: 'student',
    userTypeLabel: 'Verified User',
    quote: 'Rooms were exactly as described.',
    rating: 5,
    avatarInitial: 'S',
    displayOrder: 5,
    isActive: true
  },
  {
    externalId: 's6',
    reviewerName: 'Owner',
    reviewerRole: 'owner',
    userTypeLabel: 'Verified User',
    quote: 'Owner was cooperative during move-in.',
    rating: 5,
    avatarInitial: 'O',
    displayOrder: 6,
    isActive: true
  },
  {
    externalId: 's7',
    reviewerName: 'Working Professional',
    reviewerRole: 'working-professional',
    userTypeLabel: 'Verified User',
    quote: 'Great value for money. Recommended!',
    rating: 5,
    avatarInitial: 'W',
    displayOrder: 7,
    isActive: true
  },
  {
    externalId: 's8',
    reviewerName: 'Tenant',
    reviewerRole: 'tenant',
    userTypeLabel: 'Verified User',
    quote: 'Booking process was fast and clear.',
    rating: 5,
    avatarInitial: 'T',
    displayOrder: 8,
    isActive: true
  }
];

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('Missing MONGODB_URI or MONGO_URI');

    await mongoose.connect(mongoUri);

    for (const review of seedData) {
      await Review.findOneAndUpdate(
        { externalId: review.externalId },
        review,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const activeIds = seedData.map((r) => r.externalId);
    await Review.updateMany(
      { $or: [{ externalId: { $exists: false } }, { externalId: { $nin: activeIds } }] },
      { $set: { isActive: false } }
    );

    const total = await Review.countDocuments({});
    const active = await Review.countDocuments({ isActive: true });
    console.log(`reviews-seeded total=${total} active=${active}`);
  } catch (error) {
    console.error('reviews-seed-failed', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
