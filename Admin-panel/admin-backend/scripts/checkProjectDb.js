const { MongoClient } = require('mongodb');

require('dotenv').config();

// Connection to project database
const uri = process.env.MONGODB_URI.replace('/project', '/project');

async function checkProjectDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to project database');
    
    const db = client.db('project');
    const collections = await db.listCollections();
    
    console.log('\n=== COLLECTIONS IN PROJECT DATABASE ===');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Check document counts
    console.log('\n=== DOCUMENT COUNTS ===');
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
      
      if (count > 0 && collection.name !== 'system.indexes') {
        // Get sample documents
        const samples = await db.collection(collection.name).find({}).limit(3);
        console.log(`Sample ${collection.name}:`);
        samples.forEach((doc, i) => {
          console.log(`  ${i + 1}.`, JSON.stringify(doc, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking project database:', error);
  } finally {
    await client.close();
  }
}

checkProjectDatabase();
