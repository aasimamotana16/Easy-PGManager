const { MongoClient } = require('mongodb');

require('dotenv').config();

// Connection string to your cluster
const uri = process.env.MONGODB_URI;

async function listDatabases() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // List all databases
    const databases = await client.db().admin().listDatabases();
    
    console.log('\n=== AVAILABLE DATABASES IN CLUSTER ===');
    databases.databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.name}`);
    });
    
    // Try to get collections from each database to see which one has data
    console.log('\n=== CHECKING DATABASE CONTENTS ===');
    
    for (const db of databases.databases) {
      if (db.name !== 'admin' && db.name !== 'local') {
        try {
          const collections = await client.db(db.name).listCollections();
          console.log(`\n--- Database: ${db.name} ---`);
          
          if (collections.length > 0) {
            console.log('Collections:', collections.map(c => c.name));
            
            // Check user count in each collection
            for (const collection of collections) {
              if (collection.name === 'users' || collection.name === 'tenants' || collection.name === 'pgs') {
                const count = await client.db(db.name).collection(collection.name).countDocuments();
                console.log(`${collection.name}: ${count} documents`);
              }
            }
          } else {
            console.log('No relevant collections found');
          }
        } catch (error) {
          console.log(`Error accessing ${db.name}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error listing databases:', error);
  } finally {
    await client.close();
  }
}

listDatabases();
