const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const ownerRoutes = require('./routes/owners');
const pgRoutes = require('./routes/pgs');
const documentRoutes = require('./routes/documents');
const complaintRoutes = require('./routes/complaints');
const agreementRoutes = require('./routes/agreements');
const requestRoutes = require('./routes/requests');
const contactRoutes = require('./routes/contacts');
const reviewRoutes = require('./routes/reviews');
const adminConfigRoutes = require('./routes/adminConfig');

// EasyPG Manager Routes
const easyPGUserRoutes = require('./routes/easyPGUsers');
const easyPGRoutes = require('./routes/easyPGPGs');
const easyPGBookingRoutes = require('./routes/easyPGBookings');
const easyPGPaymentRoutes = require('./routes/easyPGPayments');
const easyPGAgreementRoutes = require('./routes/easyPGAgreements');
const easyPGSupportTicketRoutes = require('./routes/easyPGSupportTickets');
const easyPGTenantRoutes = require('./routes/easyPGTenants');
const easyPGFAQRoutes = require('./routes/easyPGFAQs');

dotenv.config();

const app = express();
const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultAllowedOrigins;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB Atlas (supports both variable names)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MongoDB URI missing. Set MONGODB_URI or MONGO_URI in environment.');
  process.exit(1);
}
mongoose.connect(mongoUri)
.then(() => {
  console.log('Connected to MongoDB Atlas successfully');
  console.log(`Using database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('MongoDB Atlas connection error:', error);
  process.exit(1);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available throughout the app
app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminConfigRoutes);
// EasyPG Manager API Routes
app.use('/api/easypg/users', easyPGUserRoutes);
app.use('/api/easypg/pgs', easyPGRoutes);
app.use('/api/easypg/bookings', easyPGBookingRoutes);
app.use('/api/easypg/payments', easyPGPaymentRoutes);
app.use('/api/easypg/agreements', easyPGAgreementRoutes);
app.use('/api/easypg/support-tickets', easyPGSupportTicketRoutes);
app.use('/api/easypg/tenants', easyPGTenantRoutes);
app.use('/api/easypg/faqs', easyPGFAQRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'EasyPG Admin Backend is running with MongoDB Atlas' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
