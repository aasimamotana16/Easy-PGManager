import React, { useEffect, useState } from "react";
import { getUsers } from "../../pages/services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>

      <div className="mb-4">
        <button
          onClick={loadUsers}
          className="bg-amber text-white px-3 py-1 rounded hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      {!loading && users && users.length === 0 && <div>No users found.</div>}

      <ul className="space-y-2">
        {users.map((u, i) => (
          <li key={u.id || i} className="border rounded p-3 bg-white">
            <div className="font-medium">{u.name || u.username || "Unnamed user"}</div>
            {u.email && <div className="text-sm text-gray-600">{u.email}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
