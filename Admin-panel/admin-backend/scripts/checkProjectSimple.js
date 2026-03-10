require('dotenv').config();
const mongoose = require('mongoose');

// Update URI to point to project database
const projectURI = process.env.MONGODB_URI.replace('/project', '/project');

mongoose.connect(projectURI)
  .then(async () => {
    console.log('Connected to project database');
    
    try {
      const db = mongoose.connection.db;
      
      // List all collections
      const collections = await db.listCollections();
      console.log('\n=== COLLECTIONS IN PROJECT DATABASE ===');
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
      
      // Check document counts for main collections
      const mainCollections = ['users', 'tenants', 'pgs', 'bookings', 'payments', 'agreements', 'supporttickets'];
      
      console.log('\n=== DOCUMENT COUNTS ===');
      for (const collectionName of mainCollections) {
        try {
          const Model = mongoose.model(collectionName.charAt(0).toUpperCase() + collectionName.slice(1));
          const count = await Model.countDocuments();
          console.log(`${collectionName}: ${count} documents`);
          
          if (count > 0) {
            const samples = await Model.find({}).limit(2);
            console.log(`Sample ${collectionName}:`);
            samples.forEach((doc, i) => {
              const key = collectionName === 'supporttickets' ? 'subject' : 'name';
              console.log(`  ${i + 1}. ${key}: ${doc[key] || doc.name || 'N/A'}`);
            });
          }
        } catch (err) {
          console.log(`Error checking ${collectionName}: ${err.message}`);
        }
      }
      
    } catch (error) {
      console.error('Database check error:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
