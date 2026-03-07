import React, { useState } from 'react';
import Swal from 'sweetalert2';
import CButton from '../cButton';

const PayNowButton = ({ amount, pgId, bookingId, intentType, description, children, className, disabled, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const colors = { primary: '#D97706' };

  const handleClick = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || token === 'null') return Swal.fire({ title: 'Session Expired', text: 'Please log in again.', icon: 'warning', confirmButtonColor: colors.primary });

    setIsProcessing(true);
    try {
      const resp = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount || 0), pgId, bookingId, type: intentType })
      });
      if (!resp.ok) throw new Error('Failed to create order');
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
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
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
            const result = await verifyRes.json();
            if (result.success) {
              Swal.fire({ title: 'Payment Successful!', text: 'Payment has been recorded.', icon: 'success', confirmButtonColor: colors.primary });
              if (typeof onSuccess === 'function') onSuccess(result);
            } else {
              Swal.fire({ title: 'Verification Failed', text: 'Payment could not be verified.', icon: 'error' });
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
      Swal.fire({ title: 'Error', text: 'Transaction failed', icon: 'error' });
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
