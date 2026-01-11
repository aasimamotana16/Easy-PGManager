const Faq = require("../models/faqModel");


// GET all FAQs (YES API)
const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error.message
    });
  }
};

// POST new FAQ
const addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Both question and answer are required"
      });
    }

    const faq = new Faq({ question, answer });
    const savedFaq = await faq.save();

    res.status(201).json({
      success: true,
      data: savedFaq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add FAQ",
      error: error.message
    });
  }
};

module.exports = { getFaqs, addFaq };