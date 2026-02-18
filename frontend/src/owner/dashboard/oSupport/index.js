import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";
import {
  createOwnerSupportTicket,
  getOwnerSupportTickets
} from "../../../api/api";

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await getOwnerSupportTickets();
      if (res.data?.success) {
        setTickets(res.data.data || []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const key = search.toLowerCase();
    return tickets.filter((t) =>
      String(t.subject || "").toLowerCase().includes(key) ||
      String(t.ticketId || "").toLowerCase().includes(key)
    );
  }, [tickets, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        subject: subject.trim(),
        description: message.trim(),
        yourName: user?.fullName || user?.name || localStorage.getItem("userName") || "Owner",
        emailAddress: user?.email || localStorage.getItem("userEmail") || "",
        phone: user?.phone || ""
      };

      const response = await createOwnerSupportTicket(payload);
      if (response.data?.success) {
        setSubject("");
        setMessage("");
        await fetchTickets();
        Swal.fire({
          title: "Success",
          text: "Support ticket submitted to admin.",
          icon: "success",
          confirmButtonColor: "#f97316"
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to send support ticket.",
        icon: "error"
      });
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className=" text-textPrimary">Support</h2>
          <p className=" text-primary">Raise and track support tickets</p>
        </div>
      </div>

      <div className="bg-white rounded-md shadow p-4 md:p-6 border border-primary">
        <h2 className="text-base md:text-lg font-semibold mb-4 text-primary">Ask for Help</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Ticket Subject"
            className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Describe your issue..."
            rows={4}
            className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <CButton type="submit" text="Submit Request" />
        </form>
      </div>

      <div className="bg-white border border-primary rounded-md shadow p-3 md:p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full border rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-primarySoft border-b">
              <tr className="text-black text-sm uppercase tracking-wider">
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium">#{t.ticketId || t._id}</td>
                  <td className="px-5 py-4 truncate max-w-[220px]">{t.subject}</td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4 text-gray-600">{t.date || new Date(t.createdAt).toISOString().split("T")[0]}</td>
                  <td className="px-5 py-4 text-center">
                    <FaEye
                      className="text-blue-600 cursor-pointer hover:scale-110 transition-transform mx-auto"
                      size={18}
                      onClick={() => setSelectedTicket(t)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {filteredTickets.map((t) => (
            <div key={t._id} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">#{t.ticketId || t._id}</span>
                <StatusBadge status={t.status} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">{t.subject}</h3>
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                <span>{t.date || new Date(t.createdAt).toISOString().split("T")[0]}</span>
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="flex items-center gap-1 text-blue-600 font-bold"
                >
                  <FaEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md p-5 md:p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg md:text-xl font-bold text-primary">Ticket #{selectedTicket.ticketId || selectedTicket._id}</h2>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-black">x</button>
            </div>

            <p className="text-sm md:text-base font-bold text-gray-800 mb-2">{selectedTicket.subject}</p>
            <p className="text-xs md:text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>

            <div className="flex items-center justify-between mb-8 px-2 overflow-x-auto">
              <StatusStep label="Open" active />
              <Divider />
              <StatusStep label="Process" active={selectedTicket.status !== "Open"} />
              <Divider />
              <StatusStep label="Done" active={selectedTicket.status === "Closed"} />
            </div>

            <CButton className="bg-primary text-white py-2 rounded-md w-full text-sm" onClick={() => setSelectedTicket(null)}>
              Close
            </CButton>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider ${
    status === "Open" ? "bg-green-100 text-green-700" :
    status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
    "bg-blue-100 text-blue-700"
  }`}>
    {status}
  </span>
);

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center min-w-[50px]">
    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-sm font-bold shadow-sm ${
      active ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
    }`}>
      ok
    </div>
    <span className={`text-[9px] md:text-[10px] mt-1 font-bold ${active ? "text-primary" : "text-gray-400"}`}>{label}</span>
  </div>
);

const Divider = () => (
  <div className="flex-1 h-[2px] bg-gray-200 mx-1 md:mx-2 mt-[-15px] md:mt-[-18px]" />
);

export default SupportPage;
