require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    try {
      const User = require('../models/EasyPGUser');
      const userCount = await User.countDocuments();
      console.log(`Total users: ${userCount}`);
      
      const Tenant = require('../models/EasyPGTenant');
      const tenantCount = await Tenant.countDocuments();
      console.log(`Total tenants: ${tenantCount}`);
      
      const PG = require('../models/EasyPGPG');
      const pgCount = await PG.countDocuments();
      console.log(`Total PGs: ${pgCount}`);
      
      console.log('Current MongoDB URI:', process.env.MONGODB_URI);
      console.log('To connect to your original EasyPG Manager database:');
      console.log('1. Update MONGODB_URI in .env file');
      console.log('2. Use your original EasyPG Manager MongoDB connection string');
      
    } catch (error) {
      console.error('Database check error:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
