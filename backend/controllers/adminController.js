import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(400).json({ message: 'Invalid admin credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid admin credentials' });
    res.json({ message: 'Admin login successful', admin: { id: admin._id, email: admin.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
