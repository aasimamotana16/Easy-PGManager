require('dotenv').config();
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  // Find the specific admin account we created
  const admin = await User.findOne({ email: 'superadmin@gmail.com' });
  
  if (admin) {
    console.log('\n=== ADMIN ACCOUNT DETAILS ===');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password Hash:', admin.password);
    
    // Test password comparison
    const testPasswords = ['Admin@123456', 'admin123456', 'password123', '123456'];
    
    for (const testPwd of testPasswords) {
      const isMatch = await bcrypt.compare(testPwd, admin.password);
      console.log(`Testing "${testPwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      
      if (isMatch) {
        console.log(`\n🎉 FOUND IT! Use this password: "${testPwd}"`);
        break;
      }
    }
  } else {
    console.log('Admin account not found');
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

