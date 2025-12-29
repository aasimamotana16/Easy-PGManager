const Documents = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-4">My Documents</h2>

      <ul className="space-y-2">
        <li>🪪 Aadhaar Card</li>
        <li>🎓 College ID</li>
        <li>📄 PG Agreement</li>
      </ul>

      <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl">
        Upload Document
      </button>
    </div>
  );
};

export default Documents;
