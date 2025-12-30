const Payments = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-2">Payments</h2>
      <p className="text-buttonDEFAULT mb-4">
        Your rent and payment history.
      </p>

      <div className="border rounded-xl p-4 mb-4">
        <p>📅 December 2025</p>
        <p>💰 Amount: ₹6,000</p>
        <p>✅ Status: Paid</p>
      </div>

      <button className="px-4 py-2 bg-green-600 text-white rounded-xl">
        Pay Next Rent
      </button>
    </div>
  );
};

export default Payments;
