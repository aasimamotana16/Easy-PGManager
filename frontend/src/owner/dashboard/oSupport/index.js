import React, { useState, useEffect } from "react";
import { FaEye, FaReply, FaLifeRing } from "react-icons/fa";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

/* Sample support tickets with tracking */
const sampleTickets = [
  {
    id: 1,
    subject: "PG listing issue",
    status: "Open",
    date: "2026-01-10",
    description: "PG approved but not visible in search.",
  },
  {
    id: 2,
    subject: "Payment not updating",
    status: "Closed",
    date: "2026-01-08",
    description: "Tenant paid but earnings not updated.",
  },
  {
    id: 3,
    subject: "Tenant information error",
    status: "In Progress",
    date: "2026-01-12",
    description: "Tenant details showing incorrect data.",
  },
];

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch support tickets from backend
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch('http://localhost:5000/api/owner/my-support-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data);
        console.log('Support tickets loaded:', data.data.length);
      } else {
        console.log('Failed to load support tickets');
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      // Fallback to sample data if API fails
      setTickets(sampleTickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh
    
    if (!subject || !message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in both subject and message fields.',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("userToken");
      
      const requestData = {
        yourName: user?.fullName || user?.name || "Owner",
        emailAddress: user?.email || "owner@example.com",
        phone: user?.phone || "0000000000",
        message: `${subject}: ${message}`
      };

      // Send to new backend API
      const response = await fetch('http://localhost:5000/api/owner/create-support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new ticket to the list
        setTickets([data.data, ...tickets]);
        setSubject("");
        setMessage("");
        
        Swal.fire({
          icon: 'success',
          title: 'Request Sent!',
          text: 'Your support request has been sent successfully. We will get back to you soon.',
          confirmButtonColor: '#f97316',
          timer: 3000,
          showConfirmButton: true
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to send request. Please try again.',
          confirmButtonColor: '#f97316'
        });
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not connect to the server. Please try again.',
        confirmButtonColor: '#f97316'
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* PAGE HEADER (LIKE OTHER DASHBOARD PAGES) */}
      <div className="flex items-center gap-3">
        <FaLifeRing className="text-orange-500 text-3xl" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Support</h1>
          <p className="text-gray-500">
            Raise and track your support tickets
          </p>
        </div>
      </div>

      {/* CREATE TICKET */}
      <div className="bg-white rounded-md shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-dark">
          Ask for Help
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Ticket Subject"
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            placeholder="Describe your issue..."
            rows={4}
            className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none md:col-span-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <CButton 
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-md w-max"
          >
            Submit Request
          </CButton>
        </form>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-md shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search tickets by subject"
          className="border rounded-md px-4 py-2 flex-1 focus:ring-2 focus:ring-orange-400 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CButton className="bg-primary text-white px-6 py-2">
          Search
        </CButton>
      </div>

      {/* TICKETS TABLE */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white border-b">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Subject</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <tr key={t._id} className="border-b">
                  <td className="px-5 py-4">{t.ticketId}</td>
                  <td className="px-5 py-4">{t.subject}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-4">{t.date}</td>
                  <td className="px-5 py-4 text-center">
                    <CButton
                      className="bg-dark text-white px-3 py-1 rounded-md flex items-center gap-1 mx-auto"
                      onClick={() => setSelectedTicket(t)}
                    >
                      <FaEye /> View
                    </CButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  {loading ? 'Loading tickets...' : 'No tickets found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TRACKING MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-primary mb-2">
              Ticket #{selectedTicket.ticketId}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Subject:</span> {selectedTicket.subject}
              </div>
              <div>
                <span className="font-semibold">Status:</span> 
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                  {selectedTicket.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Date:</span> {selectedTicket.date}
              </div>
              <div>
                <span className="font-semibold">Description:</span>
                <p className="mt-1 text-gray-600">{selectedTicket.description}</p>
              </div>
              <div>
                <span className="font-semibold">Contact:</span> {selectedTicket.yourName} ({selectedTicket.emailAddress})
              </div>
            </div>
            <CButton
              className="bg-primary text-white px-4 py-2 rounded-md w-full"
              onClick={() => setSelectedTicket(null)}
            >
              Close
            </CButton>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------- COMPONENTS --------- */

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-md text-xs font-semibold ${
      status === "Open"
        ? "bg-green-100 text-green-700"
        : status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {status}
  </span>
);

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold ${
        active ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
      }`}
    >
      ✓
    </div>
    <span className="text-xs mt-1">{label}</span>
  </div>
);

const Divider = () => (
  <div className="flex-1 h-1 bg-gray-300 mx-2 rounded-md" />
);

export default SupportPage;
