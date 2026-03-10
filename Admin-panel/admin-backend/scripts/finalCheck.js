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
      
      // Check document counts for actual EasyPG Manager collections
      console.log('\n=== DOCUMENT COUNTS ===');
      
      // Check users collection
      try {
        const userCount = await db.collection('users').countDocuments();
        console.log(`users: ${userCount} documents`);
        if (userCount > 0) {
          const users = await db.collection('users').find({}).limit(3);
          console.log('Sample users:');
          users.forEach((user, i) => {
            console.log(`  ${i + 1}. Email: ${user.email}, Role: ${user.role}, Name: ${user.fullName || user.name}`);
          });
        }
      } catch (err) {
        console.log(`Error checking users: ${err.message}`);
      }
      
      // Check tenants collection
      try {
        const tenantCount = await db.collection('tenants').countDocuments();
        console.log(`tenants: ${tenantCount} documents`);
        if (tenantCount > 0) {
          const tenants = await db.collection('tenants').find({}).limit(3);
          console.log('Sample tenants:');
          tenants.forEach((tenant, i) => {
            console.log(`  ${i + 1}. Name: ${tenant.name}, Email: ${tenant.email}, PG: ${tenant.pgId}, Status: ${tenant.status}`);
          });
        }
      } catch (err) {
        console.log(`Error checking tenants: ${err.message}`);
      }
      
      // Check pgs collection
      try {
        const pgCount = await db.collection('pgs').countDocuments();
        console.log(`pgs: ${pgCount} documents`);
        if (pgCount > 0) {
          const pgs = await db.collection('pgs').find({}).limit(3);
          console.log('Sample pgs:');
          pgs.forEach((pg, i) => {
            console.log(`  ${i + 1}. Name: ${pg.pgName}, Location: ${pg.location}, Status: ${pg.status}`);
          });
        }
      } catch (err) {
        console.log(`Error checking pgs: ${err.message}`);
      }
      
      // Check bookings collection
      try {
        const bookingCount = await db.collection('bookings').countDocuments();
        console.log(`bookings: ${bookingCount} documents`);
        if (bookingCount > 0) {
          const bookings = await db.collection('bookings').find({}).limit(3);
          console.log('Sample bookings:');
          bookings.forEach((booking, i) => {
            console.log(`  ${i + 1}. ID: ${booking.bookingId}, Tenant: ${booking.tenantName}, PG: ${booking.pgName}`);
          });
        }
      } catch (err) {
        console.log(`Error checking bookings: ${err.message}`);
      }
      
      // Check payments collection
      try {
        const paymentCount = await db.collection('payments').countDocuments();
        console.log(`payments: ${paymentCount} documents`);
        if (paymentCount > 0) {
          const payments = await db.collection('payments').find({}).limit(3);
          console.log('Sample payments:');
          payments.forEach((payment, i) => {
            console.log(`  ${i + 1}. Amount: ${payment.amountPaid}, Month: ${payment.month}, Status: ${payment.paymentStatus}`);
          });
        }
      } catch (err) {
        console.log(`Error checking payments: ${err.message}`);
      }
      
      // Check agreements collection
      try {
        const agreementCount = await db.collection('agreements').countDocuments();
        console.log(`agreements: ${agreementCount} documents`);
        if (agreementCount > 0) {
          const agreements = await db.collection('agreements').find({}).limit(3);
          console.log('Sample agreements:');
          agreements.forEach((agreement, i) => {
            console.log(`  ${i + 1}. ID: ${agreement.agreementId}, Tenant: ${agreement.tenantName}, PG: ${agreement.pgName}`);
          });
        }
      } catch (err) {
        console.log(`Error checking agreements: ${err.message}`);
      }
      
    } catch (error) {
      console.error('Database check error:', error);
    }
    
    console.log('\n=== SUCCESS! ===');
    console.log('Your EasyPG Manager database has data and is now connected!');
    console.log('Please restart your admin panel backend to see all your data.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
