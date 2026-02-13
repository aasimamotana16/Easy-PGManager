const Razorpay = require("razorpay");
const crypto = require("crypto");
const PDFDocument = require("pdfkit"); 
const Payment = require("../models/paymentModel");

// Initialize Razorpay only if keys are configured
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// 1. CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { amount, pgId } = req.body; 
    
    if (!amount || !pgId) {
      return res.status(400).json({ success: false, message: "Amount and pgId are required" });
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment gateway not configured. Please contact admin." });
    }

    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { pgId }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY & SAVE (Connects to History)
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      amountPaid, 
      pgId,
      month // Added to record the specific rent month
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Create record with fields matching your table
      const newPayment = await Payment.create({
        user: req.user.id,
        pgId, 
        amountPaid,
        month: month || "January 2026", // Fallback for your current demo
        transactionId: razorpay_payment_id,
        paymentStatus: "PAID", // Matches frontend "PAID" badge
        paymentDate: new Date()
      });

      // Populate PG details so frontend has the name immediately
      const populatedPayment = await Payment.findById(newPayment._id).populate('pgId', 'name');

      return res.status(200).json({
        success: true,
        message: "Payment recorded",
        data: populatedPayment 
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET HISTORY
const getUserPayments = async (req, res) => {
  try {
    const allPayments = await Payment.find({ user: req.user.id })
      .populate('pgId', 'name location') 
      .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, data: allPayments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

// 4. DOWNLOAD RECEIPT (Triggered by orange icon)
const downloadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('pgId');
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${payment.month}.pdf`);

    doc.pipe(res);
    doc.fontSize(25).text("RENT RECEIPT", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tenant: ${req.user.name || 'Resident'}`);
    doc.text(`Property: ${payment.pgId.name}`);
    doc.text(`Month: ${payment.month}`);
    doc.text(`Amount: ₹${payment.amountPaid}`);
    doc.text(`Status: ${payment.paymentStatus}`);
    doc.text(`Transaction ID: ${payment.transactionId}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF" });
  }
};

module.exports = { createOrder, verifyPayment, getUserPayments, downloadReceipt };