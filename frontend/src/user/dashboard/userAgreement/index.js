const Agreement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-2">PG Agreement</h2>

      <p className="text-buttonDEFAULT mb-4">
        Your digital PG agreement is active.
      </p>

      <button className="px-4 py-2 bg-primary text-white rounded-xl mr-3">
        View Agreement
      </button>
      <button className="px-4 py-2 bg-gray-700 text-white rounded-xl">
        Download PDF
      </button>
    </div>
  );
};

export default Agreement;
