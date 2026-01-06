import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Payments = () => {
  // Using camelCase for state
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:5000/api/payments/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPaymentHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-2">Payments</h2>
      <p className="text-buttonDEFAULT mb-4">
        Your rent and payment history.
      </p>

      {/* This section now repeats for every payment in Atlas */}
      {paymentHistory.map((payment) => (
        <div key={payment._id} className="border rounded-xl p-4 mb-4">
          <p>📅 {new Date(payment.paymentDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          <p>💰 Amount: ₹{payment.amountPaid}</p>
          <p>✅ Status: {payment.paymentStatus}</p>
        </div>
      ))}

      {/* If no data is found, show one empty box or your partner's default */}
      {paymentHistory.length === 0 && (
        <div className="border rounded-xl p-4 mb-4 italic text-gray-400">
          No payment history found.
        </div>
      )}

      <button className="px-4 py-2 bg-green-600 text-white rounded-xl">
        Pay Next Rent
      </button>
    </div>
  );
};

export default Payments;