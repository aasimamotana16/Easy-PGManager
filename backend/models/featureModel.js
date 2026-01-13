const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true }, // Using 'desc' to match your frontend mapping
  category: { type: String, required: true }, // Add this to support your controller filter! [
  iconName: { type: String }, // Optional: if you want to store icon names in camelCase
}, { timestamps: true });

module.exports = mongoose.model("Feature", featureSchema);