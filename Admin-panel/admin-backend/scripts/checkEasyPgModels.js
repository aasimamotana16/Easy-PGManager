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
      
      // Try to get document counts directly
      console.log('\n=== DOCUMENT COUNTS ===');
      for (const collection of collections) {
        try {
          const count = await db.collection(collection.name).countDocuments();
          console.log(`${collection.name}: ${count} documents`);
          
          if (count > 0 && collection.name !== 'system.indexes') {
            const samples = await db.collection(collection.name).find({}).limit(2);
            console.log(`Sample ${collection.name}:`);
            samples.forEach((doc, i) => {
              console.log(`  ${i + 1}.`, JSON.stringify(doc, null, 2));
            });
          }
        } catch (err) {
          console.log(`Error checking ${collection.name}: ${err.message}`);
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
