const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDateOnly = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const validateMoveIn = ({
  securityDepositPaid,
  initialRentPaid,
  ownerApprovalStatus
}) => {
  if (!securityDepositPaid) {
    return { allowed: false, code: "SECURITY_DEPOSIT_PENDING", message: "Security deposit payment is required before move-in." };
  }
  if (!initialRentPaid) {
    return { allowed: false, code: "INITIAL_RENT_PENDING", message: "Initial rent payment is required before move-in." };
  }
  if (String(ownerApprovalStatus || "").toLowerCase() !== "approved") {
    return { allowed: false, code: "OWNER_APPROVAL_PENDING", message: "Owner approval is required before move-in." };
  }
  return { allowed: true, code: "OK", message: "Move-in allowed." };
};

const calculateLateFine = ({
  dueDate,
  dailyFine = 100,
  isFinePaused = false,
  referenceDate = new Date()
}) => {
  const due = normalizeDateOnly(dueDate);
  const ref = normalizeDateOnly(referenceDate);
  if (!due || !ref) {
    return { overdueDays: 0, fineAmount: 0, isFinePaused: Boolean(isFinePaused) };
  }

  const overdueDays = Math.max(0, Math.floor((ref - due) / DAY_MS));
  if (isFinePaused || overdueDays === 0) {
    return { overdueDays, fineAmount: 0, isFinePaused: Boolean(isFinePaused) };
  }

  return {
    overdueDays,
    fineAmount: overdueDays * Math.max(0, Number(dailyFine) || 0),
    isFinePaused: false
  };
};

module.exports = {
  validateMoveIn,
  calculateLateFine
};
