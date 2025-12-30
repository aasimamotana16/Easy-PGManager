const Support = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-2">Support</h2>

      <p className="text-buttonDEFAULT mb-4">
        Need help? Raise a support ticket.
      </p>

      <button className="px-4 py-2 bg-primary text-white rounded-xl mr-3">
        Raise Ticket
      </button>
      <button className="px-4 py-2 bg-gray-800 text-white rounded-xl">
        Contact Owner
      </button>
    </div>
  );
};

export default Support;
