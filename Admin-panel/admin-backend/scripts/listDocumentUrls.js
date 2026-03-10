require('dotenv').config();
const mongoose = require('mongoose');
const EasyPGUser = require('../models/EasyPGUser');
const EasyPGPG = require('../models/EasyPGPG');

const summarizePath = (value) => {
  if (!value) return 'missing';
  if (/^https?:\/\//i.test(value)) return 'absolute-url';
  if (value.startsWith('/uploads/') || value.startsWith('uploads/')) return 'uploads-path';
  return 'other-path';
};

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI or MONGO_URI');
  }

  await mongoose.connect(mongoUri);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const users = await EasyPGUser.find({}).select('+idDocument +aadharCard +rentalAgreementCopy');
  const pgs = await EasyPGPG.find({});

  const rows = [];

  for (const user of users) {
    const docs = [
      ['idDocument', user.idDocument?.fileUrl],
      ['aadharCard', user.aadharCard?.fileUrl],
      ['rentalAgreementCopy', user.rentalAgreementCopy?.fileUrl]
    ];

    for (const [field, fileUrl] of docs) {
      if (!fileUrl) continue;
      rows.push({
        source: 'users',
        id: String(user._id),
        owner: user.fullName || user.name || user.email || 'unknown',
        field,
        type: summarizePath(fileUrl),
        value: fileUrl
      });
    }
  }

  for (const pg of pgs) {
    const docs = [
      ['proofDocuments.aadhaar', pg.proofDocuments?.aadhaar],
      ['proofDocuments.electricityBill', pg.proofDocuments?.electricityBill],
      ['proofDocuments.propertyTax', pg.proofDocuments?.propertyTax]
    ];

    for (const [field, fileUrl] of docs) {
      if (!fileUrl) continue;
      rows.push({
        source: 'pgs',
        id: String(pg._id),
        owner: pg.pgName || 'unknown',
        field,
        type: summarizePath(fileUrl),
        value: fileUrl
      });
    }
  }

  if (!rows.length) {
    console.log('No document URLs found in users/pgs collections.');
    return;
  }

  const counts = rows.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] || 0) + 1;
    return acc;
  }, {});

  console.log('\nDocument URL types:');
  for (const [type, count] of Object.entries(counts)) {
    console.log(`- ${type}: ${count}`);
  }

  console.log('\nSample rows (up to 30):');
  rows.slice(0, 30).forEach((row, index) => {
    console.log(`${index + 1}. [${row.source}] ${row.owner} | ${row.field} | ${row.type}`);
    console.log(`   ${row.value}`);
  });
};

run()
  .catch((error) => {
    console.error('Error:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
