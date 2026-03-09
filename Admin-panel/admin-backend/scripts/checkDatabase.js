require('dotenv').config();
const mongoose = require('mongoose');

// Test current database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to current database');
    
    try {
      // Check if we can find users in current database
      const User = require('../models/EasyPGUser');
      const userCount = await User.countDocuments();
      console.log('\n=== CURRENT DATABASE USERS ===');
      console.log(`Total users: ${userCount}`);
      
      if (userCount > 0) {
        const users = await User.find({}).limit(5);
        console.log('Sample users:');
        users.forEach((user, index) => {
          console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Name: ${user.fullName || user.name}`);
        });
      }
      
      // Check tenants
      const Tenant = require('../models/EasyPGTenant');
      const tenantCount = await Tenant.countDocuments();
      console.log('\n=== CURRENT DATABASE TENANTS ===');
      console.log(`Total tenants: ${tenantCount}`);
      
      if (tenantCount > 0) {
        const tenants = await Tenant.find({}).limit(5);
        console.log('Sample tenants:');
        tenants.forEach((tenant, index) => {
          console.log(`${index + 1}. Name: ${tenant.name}, Email: ${tenant.email}, PG: ${tenant.pgId}, Status: ${tenant.status}`);
        });
      }
      
      // Check PGs
      const PG = require('../models/EasyPGPG');
      const pgCount = await PG.countDocuments();
      console.log('\n=== CURRENT DATABASE PGs ===');
      console.log(`Total PGs: ${pgCount}`);
      
      if (pgCount > 0) {
        const pgs = await PG.find({}).limit(3);
        console.log('Sample PGs:');
        pgs.forEach((pg, index) => {
          console.log(`${index + 1}. Name: ${pg.pgName}, Location: ${pg.location}, Status: ${pg.status}`);
        });
      }
      console.log('\n=== DATABASE CONNECTION INFO ===');
      console.log('Current MongoDB URI:', process.env.MONGODB_URI);
      console.log('\nTo connect to your original EasyPG Manager database:');
      console.log('1. Update MONGODB_URI in .env file');
      console.log('2. Use your original EasyPG Manager MongoDB connection string');
      console.log('3. Restart the server');

      process.exit(0);
    } catch (error) {
      console.error('Database check error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
