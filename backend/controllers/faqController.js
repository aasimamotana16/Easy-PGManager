const Faq = require("../models/faqModel");

const inferCategoryFromQuestion = (question = "") => {
  const q = String(question).toLowerCase().trim();

  if (q.includes("support") || q.includes("contact") || q.includes("feature request")) {
    return "Support Team";
  }
  if (q.includes("payment") || q.includes("rent") || q.includes("receipt") || q.includes("billing")) {
    return "Billing & Payments";
  }
  if (q.includes("maintenance") || q.includes("integrate") || q.includes("data secure")) {
    return "Miscellaneous";
  }
  return "General Questions";
};


// GET all FAQs (YES API)
const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ createdAt: -1 });
    const normalizedFaqs = faqs.map((faq) => {
      const plain = faq.toObject();
      const rawCategory = (plain.category || "").trim();
      const needsInference = !rawCategory || rawCategory.toLowerCase() === "general questions";
      return {
        ...plain,
        category: needsInference ? inferCategoryFromQuestion(plain.question) : rawCategory,
      };
    });

    res.status(200).json({
      success: true,
      count: normalizedFaqs.length,
      data: normalizedFaqs
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
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Both question and answer are required"
      });
    }

    const faq = new Faq({ question, answer, category: category || inferCategoryFromQuestion(question) });
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
