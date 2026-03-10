require('dotenv').config();
const User = require('../models/User');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  // Find all users to show existing accounts
  const users = await User.find({}).select('-password');
  console.log('\n=== EXISTING USERS ===');
  users.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt}`);
    console.log('---');
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
