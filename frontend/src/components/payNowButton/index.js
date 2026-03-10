import React, { useState } from 'react';
import Swal from 'sweetalert2';
import CButton from '../cButton';
import { API_BASE } from "../../config/apiBaseUrl";

const PayNowButton = ({ amount, pgId, bookingId, intentType, description, children, className, disabled, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const colors = { primary: '#D97706' };

  const ensureRequiredDocumentsForRent = async (token) => {
    // Only block monthly rent payments; allow move-in/first payments.
    if (String(intentType || '').toUpperCase() !== 'MONTHLY_RENT') return true;

    try {
      const docsRes = await fetch(`${API_BASE}/users/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docsJson = await docsRes.json();

      if (!docsRes.ok || !docsJson?.success) {
        // Fail-open if docs endpoint is temporarily unavailable.
        return true;
      }

      const docs = docsJson?.data || {};
      const required = [
        { key: 'idDocument', label: 'ID Document' },
        { key: 'aadharCard', label: 'Aadhar Card' },
        { key: 'rentalAgreementCopy', label: 'Signed Agreement' }
      ];

      const missing = required
        .filter((r) => {
          const status = String(docs?.[r.key]?.status || 'Pending');
          const fileUrl = String(docs?.[r.key]?.fileUrl || '').trim();
          return status === 'Pending' || !fileUrl;
        })
        .map((r) => r.label);

      if (missing.length === 0) return true;

      await Swal.fire({
        title: 'Upload Documents First',
        text: `Please upload: ${missing.join(', ')}.`,
        icon: 'warning',
        confirmButtonColor: colors.primary
      });
      return false;
    } catch (e) {
      // Fail-open on unexpected errors to avoid blocking payments due to client issues.
      return true;
    }
  };

  const handleClick = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || token === 'null') return Swal.fire({ title: 'Session Expired', text: 'Please log in again.', icon: 'warning', confirmButtonColor: colors.primary });

    setIsProcessing(true);
    try {
      const okToProceed = await ensureRequiredDocumentsForRent(token);
      if (!okToProceed) return;

      const resp = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount || 0), pgId, bookingId, type: intentType })
      });
      if (!resp.ok) {
        let message = 'Failed to create order';
        try {
          const errJson = await resp.json();
          if (errJson?.message) message = String(errJson.message);
        } catch (_) {
          // ignore
        }
        throw new Error(message);
      }
      const { order } = await resp.json();

      const options = {
        key: 'rzp_test_S9ZmF0zUNli8eT',
        amount: order.amount,
        currency: 'INR',
        name: 'EasyPG Manager',
        description: description || 'Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountPaid: order.amount / 100,
                pgId,
                bookingId,
                type: intentType
              })
            });
            let result = null;
            try {
              result = await verifyRes.json();
            } catch (e) {
              result = null;
            }

            if (verifyRes.ok && result?.success) {
              Swal.fire({ title: 'Payment Successful!', text: 'Payment has been recorded.', icon: 'success', confirmButtonColor: colors.primary });
              if (typeof onSuccess === 'function') onSuccess(result);
            } else {
              const serverMessage = result?.message ? String(result.message) : '';
              Swal.fire({
                title: 'Verification Failed',
                text: serverMessage || 'Payment could not be verified.',
                icon: 'error',
                confirmButtonColor: colors.primary
              });
            }
          } catch (err) {
            console.error('Verification error', err);
            Swal.fire({ title: 'Error', text: 'Verification failed', icon: 'error' });
          }
        },
        theme: { color: colors.primary }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment Error:', err);
      Swal.fire({ title: 'Error', text: err?.message || 'Transaction failed', icon: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CButton onClick={handleClick} disabled={disabled || isProcessing} className={className}>
      {isProcessing ? 'PROCESSING...' : (children || 'PAY NOW')}
    </CButton>
  );
};

export default PayNowButton;
