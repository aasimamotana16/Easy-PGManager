import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema({
  userId: String,
  totalBookings: Number,
  totalRooms: Number,
  pendingPayments: Number
}, { timestamps: true });

const UserDashboard = mongoose.model("UserDashboard", dashboardSchema);
export default UserDashboard;