const Timeline = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-4">Stay Timeline</h2>

      <ul className="space-y-3 text-buttonDEFAULT">
        <li>✅ Booking Confirmed</li>
        <li>🏠 PG Check-in Completed</li>
        <li>💰 Last Rent Paid: ₹6,000</li>
        <li>📄 Agreement Uploaded</li>
      </ul>

      <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl">
        Download Timeline
      </button>
    </div>
  );
};

export default Timeline;
