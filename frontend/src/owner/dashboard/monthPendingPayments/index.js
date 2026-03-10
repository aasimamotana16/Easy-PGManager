import React, { useEffect, useMemo, useState } from "react";
import { FaClock, FaRegPaperPlane } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import CButton from "../../../components/cButton";
import { API_BASE } from "../../../config/apiBaseUrl";

const ITEMS_PER_PAGE = 5;
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const MonthPendingPayments = () => {
  const [rows, setRows] = useState([]);
  const [pendingSummary, setPendingSummary] = useState({ totalAmount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const currentMonth = useMemo(() => MONTH_OPTIONS[new Date().getMonth()], []);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          setRows([]);
          setPendingSummary({ totalAmount: 0 });
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/owner/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            month: currentMonth,
            from: "quick-action",
            pendingScope: "current-month",
          },
        });

        if (response.data?.success) {
          const data = response.data.data || {};
          setRows(Array.isArray(data.pendingPayments) ? data.pendingPayments : []);
          setPendingSummary(data.pendingSummary || { totalAmount: 0 });
        } else {
          setRows([]);
          setPendingSummary({ totalAmount: 0 });
        }
      } catch (error) {
        setRows([]);
        setPendingSummary({ totalAmount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [currentMonth]);

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;
  const paginated = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleResendPaymentLink = async (bookingId, tenantName) => {
    if (!bookingId) {
      Swal.fire({
        title: "Booking Missing",
        text: `Booking not found for ${tenantName || "this tenant"}.`,
        icon: "warning",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Resend Payment Link?",
      text: `Payment link will be sent again to ${tenantName || "tenant"}.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      confirmButtonText: "Yes, resend",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("userToken");
      Swal.fire({
        title: "Sending...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(`${API_BASE}/owner/send-payment-link/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Sent!",
        text: res.data?.message || "Payment link has been sent successfully.",
        icon: "success",
        confirmButtonColor: "#D97706",
      });
    } catch (error) {
      Swal.fire({
        title: "Failed",
        text: error.response?.data?.message || "Unable to send payment link.",
        icon: "error",
        confirmButtonColor: "#D97706",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen space-y-6">
      <div>
        <h2 className="text-textPrimary">Monthy Pending Payments</h2>
        <p className="text-primary">Showing only current-month pending payments.</p>
      </div>

      <div className="bg-white p-4 md:p-6 border border-primary rounded-md shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 text-dark">
            <FaClock className="text-red-500" /> Pending Payments
          </h2>
          <div className="text-xs sm:text-sm text-right font-semibold text-gray-700">
            Pending Total: <span className="text-red-700">{formatMoney(pendingSummary.totalAmount)}</span>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">User</th>
                <th className="py-3 px-4 text-left font-semibold">PG Name</th>
                <th className="py-3 px-4 text-left font-semibold">Amount</th>
                <th className="py-3 px-4 text-left font-semibold">Late Fee</th>
                <th className="py-3 px-4 text-left font-semibold">Actual Due Date</th>
                <th className="py-3 px-4 text-left font-semibold">Total Amount</th>
                <th className="py-3 px-4 text-center font-semibold">Resend Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((row) => (
                  <tr key={row.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">{row.userName || row.tenant || "Unknown Tenant"}</td>
                    <td className="py-4 px-4">{row.pg || "Unknown PG"}</td>
                    <td className="py-4 px-4 font-semibold">{formatMoney(row.amount)}</td>
                    <td className="py-4 px-4 text-red-600 font-semibold">{formatMoney(row.lateFee)}</td>
                    <td className="py-4 px-4">{row.actualDueDate || row.due || "-"}</td>
                    <td className="py-4 px-4 text-red-700 font-bold">{formatMoney(row.totalAmount)}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleResendPaymentLink(row.bookingId || row.id, row.userName || row.tenant)}
                        className="inline-flex items-center justify-center p-2 rounded-md border border-orange-200 text-[#D97706] hover:bg-[#FEF3C7] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!(row.bookingId || row.id)}
                        title="Resend Payment Link"
                      >
                        <FaRegPaperPlane size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between sm:justify-end items-center gap-4 mt-6 border-t pt-4">
          <CButton
            text="Prev"
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="text-xs"
          />
          <span className="text-xs font-bold text-gray-600">
            Page {page} of {totalPages}
          </span>
          <CButton
            text="Next"
            variant="outlined"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default MonthPendingPayments;
