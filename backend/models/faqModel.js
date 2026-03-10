const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: "General Questions" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Faq = mongoose.model("Faq", faqSchema);
module.exports = Faq;
