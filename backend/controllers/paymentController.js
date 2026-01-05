const Payment = require("../models/paymentModel");

// Get all payments for the logged-in user
const getUserPayments = async (req, res) => {
  try {
    const allPayments = await Payment.find({ user: req.user.id }).sort({ paymentDate: -1 });
    res.status(200).json({
      success: true,
      count: allPayments.length,
      data: allPayments
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

// Admin or System adds a payment record
const addPaymentRecord = async (req, res) => {
  try {
    const { amountPaid, paymentMethod, transactionId, paymentStatus } = req.body;
    
    const newPayment = await Payment.create({
      user: req.user.id,
      amountPaid,
      paymentMethod,
      transactionId,
      paymentStatus
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: newPayment
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to record payment", error: error.message });
  }
};

module.exports = { getUserPayments, addPaymentRecord };