const nodemailer = require("nodemailer");

const PendingPayment = require("../models/pendingPaymentModel");

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const normalizeBaseUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Cron endpoint: sends rent reminder emails for payments due today.
// Idempotent per PendingPayment per day via `dueDateReminderLastSentAt`.
const sendDueDateRentReminders = async (req, res) => {
  try {
    // Optional protection: if CRON_SECRET is set, require it.
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const provided =
        req.headers["x-cron-secret"] ||
        req.query.cron_secret ||
        req.query.cronSecret;

      if (String(provided || "") !== String(cronSecret)) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured on server",
      });
    }

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);

    const dueTodayQuery = {
      status: { $in: ["Pending"] },
      dueDate: { $gte: dayStart, $lte: dayEnd },
      $or: [
        { dueDateReminderLastSentAt: { $exists: false } },
        { dueDateReminderLastSentAt: null },
        { dueDateReminderLastSentAt: { $lt: dayStart } },
      ],
    };

    const pendingPayments = await PendingPayment.find(dueTodayQuery)
      .populate("tenant", "email fullName name")
      .select("tenant pgName tenantName amount dueDate dueDateReminderLastSentAt");

    if (!pendingPayments.length) {
      return res.status(200).json({
        success: true,
        message: "No due-date reminders to send today",
        data: { processed: 0, sent: 0, skipped: 0 },
      });
    }

    const frontendUrl = normalizeBaseUrl(
      process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000"
    );

    const transporter = createTransporter();

    let sent = 0;
    let skipped = 0;

    for (const pending of pendingPayments) {
      const recipientEmail = pending?.tenant?.email;
      if (!recipientEmail) {
        skipped += 1;
        continue;
      }

      const paymentLink = frontendUrl
        ? `${frontendUrl}/user/dashboard/payments`
        : "";

      const displayName =
        pending.tenantName || pending?.tenant?.fullName || pending?.tenant?.name || "Tenant";

      const subject = `Rent Payment Due Today - ${pending.pgName}`;
      const dueDateText = pending.dueDate
        ? new Date(pending.dueDate).toLocaleDateString()
        : "today";

      const html = `
        <h2>Rent Payment Reminder</h2>
        <p>Dear ${displayName},</p>
        <p>This is a reminder that your rent payment for <strong>${pending.pgName}</strong> is due on <strong>${dueDateText}</strong>.</p>
        <p><strong>Amount:</strong> Rs. ${Number(pending.amount || 0).toLocaleString()}</p>
        ${paymentLink ? `<p><a href="${paymentLink}" target="_blank" rel="noopener noreferrer">Pay Now</a></p>` : ""}
        ${paymentLink ? `<p>If the button does not work, copy this URL:</p><p>${paymentLink}</p>` : ""}
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject,
        html,
      });

      await PendingPayment.updateOne(
        { _id: pending._id },
        {
          $set: { dueDateReminderLastSentAt: new Date() },
          $inc: { dueDateReminderSentCount: 1 },
        }
      );

      sent += 1;
    }

    return res.status(200).json({
      success: true,
      message: "Due-date rent reminders processed",
      data: {
        processed: pendingPayments.length,
        sent,
        skipped,
      },
    });
  } catch (error) {
    console.error("Due-date reminder cron error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendDueDateRentReminders,
};
