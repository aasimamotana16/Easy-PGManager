const DEFAULT_PLATFORM_COMMISSION_PERCENT = 10;

const roundMoney = (value) => {
  const num = Number(value) || 0;
  return Number(num.toFixed(2));
};

const resolveCommissionPercent = (rawPercent) => {
  const parsed = Number(rawPercent);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_PLATFORM_COMMISSION_PERCENT;
  }
  return parsed;
};

const computeCommissionBreakdown = ({ amount = 0, commissionPercent } = {}) => {
  const grossAmount = Math.max(0, roundMoney(amount));
  const commissionRatePercent = resolveCommissionPercent(commissionPercent);
  const platformCommissionAmount = roundMoney((grossAmount * commissionRatePercent) / 100);
  const ownerPayoutAmount = Math.max(0, roundMoney(grossAmount - platformCommissionAmount));

  return {
    grossAmount,
    commissionRatePercent,
    platformCommissionAmount,
    ownerPayoutAmount
  };
};

const dateOnly = (input) => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const isAfterDay = (left, right) => {
  const l = dateOnly(left);
  const r = dateOnly(right);
  if (!l || !r) return false;
  return l.getTime() > r.getTime();
};

const isOnOrBeforeDay = (left, right) => {
  const l = dateOnly(left);
  const r = dateOnly(right);
  if (!l || !r) return false;
  return l.getTime() <= r.getTime();
};

const computeCancellationRefundSummary = ({
  cancelledBy = "tenant",
  hasMovedIn = false,
  cancellationDate = new Date(),
  checkInDate,
  totalPaidAmount = 0,
  securityDepositAmount = 0,
  totalCommissionAmount = 0
} = {}) => {
  const grossPaid = Math.max(0, roundMoney(totalPaidAmount));
  const totalCommission = Math.max(0, roundMoney(totalCommissionAmount));
  const securityDeposit = Math.max(0, roundMoney(securityDepositAmount));
  const normalizedCancelledBy = String(cancelledBy || "tenant").toLowerCase() === "owner" ? "owner" : "tenant";

  if (grossPaid <= 0) {
    return {
      cancelledBy: normalizedCancelledBy,
      hasMovedIn,
      grossPaidAmount: 0,
      nonRefundableCommissionAmount: 0,
      noShowDeductionAmount: 0,
      refundableAmount: 0,
      refundRule: "NO_PAYMENT_FOUND",
      note: "No successful booking payment found for refund processing."
    };
  }

  if (hasMovedIn) {
    return {
      cancelledBy: normalizedCancelledBy,
      hasMovedIn: true,
      grossPaidAmount: grossPaid,
      nonRefundableCommissionAmount: 0,
      noShowDeductionAmount: 0,
      refundableAmount: 0,
      refundRule: "POST_MOVE_IN_NO_REFUND",
      note: "Cancellation after move-in is generally non-refundable."
    };
  }

  const ownerCancelledBeforeMoveIn = normalizedCancelledBy === "owner" && isOnOrBeforeDay(cancellationDate, checkInDate);
  if (ownerCancelledBeforeMoveIn) {
    return {
      cancelledBy: normalizedCancelledBy,
      hasMovedIn: false,
      grossPaidAmount: grossPaid,
      nonRefundableCommissionAmount: 0,
      noShowDeductionAmount: 0,
      refundableAmount: grossPaid,
      refundRule: "OWNER_CANCEL_FULL_REFUND",
      note: "Owner cancelled booking before move-in, so full booking amount is refundable."
    };
  }

  const nonRefundableCommissionAmount = Math.min(grossPaid, totalCommission);
  const afterCommission = Math.max(0, roundMoney(grossPaid - nonRefundableCommissionAmount));
  const isNoShowCase = isAfterDay(cancellationDate, checkInDate);
  const noShowDeductionAmount = isNoShowCase ? roundMoney(securityDeposit * 0.15) : 0;
  const refundableAmount = Math.max(0, roundMoney(afterCommission - noShowDeductionAmount));

  return {
    cancelledBy: normalizedCancelledBy,
    hasMovedIn: false,
    grossPaidAmount: grossPaid,
    nonRefundableCommissionAmount,
    noShowDeductionAmount,
    refundableAmount,
    refundRule: isNoShowCase ? "TENANT_NO_SHOW_PARTIAL_REFUND" : "TENANT_PRE_MOVE_IN_PARTIAL_REFUND",
    note: isNoShowCase
      ? "No-show cancellation applies 15% security deposit deduction after non-refundable platform commission."
      : "Pre move-in tenant cancellation keeps platform commission non-refundable."
  };
};

const getOwnerPayoutAmount = (payment = {}) => {
  const ownerPayout = Number(payment?.ownerPayoutAmount);
  if (Number.isFinite(ownerPayout)) return ownerPayout;
  return Number(payment?.amountPaid || 0) || 0;
};

module.exports = {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  computeCommissionBreakdown,
  computeCancellationRefundSummary,
  getOwnerPayoutAmount,
  roundMoney
};
