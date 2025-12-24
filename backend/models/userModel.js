import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['tenant', 'admin'], default: 'tenant' },
  resetToken: String,
  resetTokenExpire: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
