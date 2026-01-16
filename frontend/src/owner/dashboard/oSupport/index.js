import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import { FaEye, FaReply } from "react-icons/fa"; // Icons for View and Reply

// Sample support tickets
const sampleTickets = [
  {
    id: 1,
    subject: "PG listing issue",
    status: "Open",
    date: "2026-01-10",
  },
  {
    id: 2,
    subject: "Payment not updating",
    status: "Closed",
    date: "2026-01-08",
  },
  {
    id: 3,
    subject: "Tenant information error",
    status: "Open",
    date: "2026-01-12",
  },
];

const SupportPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState(sampleTickets);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // Filter tickets dynamically based on search input
  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Handle ticket creation
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    const newTicket = {
      id: tickets.length + 1,
      subject,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };
    setTickets([newTicket, ...tickets]);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="p-6 bg-dashboard-gradient min-h-screen rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4 md:mb-0">Support</h2>
        <CButton
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
          onClick={() => navigate("/owner/dashboard")}
        >
          Add New Ticket
        </CButton>
      </div>

      {/* Create Ticket Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Create a Support Ticket</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Subject"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Describe your issue..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <CButton
            type="submit"
            className="bg-amber-500 text-white px-5 py-2 rounded-md hover:bg-amber-600 w-max"
          >
            Submit Ticket
          </CButton>
        </form>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tickets by subject"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CButton
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
          onClick={() => {}}
        >
          Search
        </CButton>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Subject
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 text-sm text-gray-800">{t.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{t.subject}</td>
                  <td
                    className={`px-4 py-2 text-sm font-semibold ${
                      t.status === "Open" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.status}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">{t.date}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <CButton
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
                      onClick={() => navigate("/owner/dashboard")}
                    >
                      <FaEye /> View
                    </CButton>
                    <CButton
                      className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 flex items-center gap-1"
                      onClick={() => navigate("/owner/dashboard")}
                    >
                      <FaReply /> Reply
                    </CButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportPage;
