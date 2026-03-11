const express = require("express");

const { sendDueDateRentReminders } = require("../controllers/rentReminderController");

const router = express.Router();

// GET /api/cron/rent-reminders/due-date
router.get("/rent-reminders/due-date", sendDueDateRentReminders);

module.exports = router;
