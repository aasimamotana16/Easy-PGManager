require('dotenv').config();
const User = require('../models/User');
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MongoDB URI missing. Set MONGODB_URI or MONGO_URI in environment.');
  process.exit(1);
}

mongoose.connect(mongoUri)
.then(async () => {
  console.log('Connected to MongoDB Atlas');

  try {
    let admin = await User.findOne({ email: 'superadmin@gmail.com' });
    if (!admin) {
      admin = new User({
        username: 'superadmin',
        email: 'superadmin@gmail.com',
        password: 'Admin@123456',
        role: 'admin',
        isActive: true
      });
    } else {
      admin.username = 'superadmin';
      admin.password = 'Admin@123456';
      admin.role = 'admin';
      admin.isActive = true;
    }

    await admin.save();
    console.log('\n=== ADMIN ACCOUNT IS READY ===');
    console.log('Email: superadmin@gmail.com');
    console.log('Username: superadmin');
    console.log('Password: Admin@123456');
    console.log('Role: admin');
    console.log('\nYou can now login with these credentials!');
    console.log('URL: http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

