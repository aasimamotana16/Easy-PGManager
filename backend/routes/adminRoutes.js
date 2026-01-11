const express = require('express');
const router = express.Router();
const { 
  adminLogin, 
  getAdminDashboardStats, 
  addUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', adminLogin);
router.get('/dashboard-stats', protect, getAdminDashboardStats);
router.post('/add-user', protect, addUser); // Add Button [cite: 2026-01-06]
router.put('/update-user/:id', protect, updateUser); // Edit Button [cite: 2026-01-07]
router.delete('/delete-user/:id', protect, deleteUser); // Delete Button

module.exports = router;