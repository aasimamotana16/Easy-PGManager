import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  type: String,
  price: Number
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;