import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaCalendarAlt,
  FaDownload,
  FaClock,
  FaRegPaperPlane,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import Swal from "sweetalert2";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import { API_BASE } from "../../../config/apiBaseUrl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ITEMS_PER_PAGE = 5;
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMPTY_DATA = {
  stats: { total: 0, monthly: 0, today: 0 },
  chartData: { labels: [], datasets: [] },
  earningsHistory: [],
  pendingPayments: [],
  pendingSummary: { baseAmount: 0, lateFee: 0, totalAmount: 0 },
  meta: { fromQuickAction: false, pendingScope: "all" },
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const TotalEarnings = () => {
  const [searchParams] = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_OPTIONS[new Date().getMonth()]
  );
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [earningsData, setEarningsData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const fromQuickAction = String(searchParams.get("from") || searchParams.get("source") || "").toLowerCase() === "quick-action";
  const pendingScope = String(searchParams.get("pendingScope") || "").toLowerCase();
  const currentMonthPendingOnly = fromQuickAction || pendingScope === "current-month";

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          setEarningsData(EMPTY_DATA);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/owner/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            month: selectedMonth,
            ...(currentMonthPendingOnly ? { from: "quick-action", pendingScope: "current-month" } : {}),
          },
        });

        if (response.data.success) {
          setEarningsData({
            ...EMPTY_DATA,
            ...response.data.data,
          });
        } else {
          setEarningsData(EMPTY_DATA);
        }
      } catch (error) {
        setEarningsData(EMPTY_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [currentMonthPendingOnly, selectedMonth]);

  const earningsStats = earningsData?.stats || EMPTY_DATA.stats;
  const chartData = earningsData?.chartData || EMPTY_DATA.chartData;
  const earningsHistory = earningsData?.earningsHistory || [];
  const pendingPayments = earningsData?.pendingPayments || [];
  const pendingSummary = earningsData?.pendingSummary || EMPTY_DATA.pendingSummary;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#e5e7eb" } },
    },
  };

  const paginate = (data, page) => data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const paginatedPending = paginate(pendingPayments, pendingPage);
  const paginatedHistory = paginate(earningsHistory, historyPage);

  const totalPendingPages = Math.ceil(pendingPayments.length / ITEMS_PER_PAGE) || 1;
  const totalHistoryPages = Math.ceil(earningsHistory.length / ITEMS_PER_PAGE) || 1;

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      Swal.fire({ title: "Login Required", text: "Please log in to download.", icon: "warning", confirmButtonColor: "#f97316" });
      return;
    }

    Swal.fire({
      title: "Generating Report...",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await axios.get(`${API_BASE}/owner/earnings/pdf?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Earnings_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      Swal.close();
    } catch (error) {
      Swal.fire({
        title: "Download Failed",
        text: error.response?.data?.message || "Backend report download failed.",
        icon: "error",
        confirmButtonColor: "#D97706",
      });
    }
  };

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
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-textPrimary">
            Earnings Overview
          </h2>
          <p className="text-primary">
            Track your income and pending payments
            {loading && <span className="ml-2 text-orange-500 animate-pulse">(Loading...)</span>}
          </p>
          {currentMonthPendingOnly && (
            <p className="text-xs text-orange-700 mt-1">
              Showing only current-month pending payments (opened from Quick Action).
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SummaryCard title="Total Earnings" value={formatMoney(earningsStats.total)} icon={<FaMoneyBillWave />} />
        <SummaryCard title="This Month" value={formatMoney(earningsStats.monthly)} icon={<FaArrowUp />} />
        <SummaryCard title="Today" value={formatMoney(earningsStats.today)} icon={<FaCalendarAlt />} />
      </div>

      <div className="bg-white p-4 rounded-md shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
        <CSelect
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          options={MONTH_OPTIONS.map((m) => ({ value: m, label: m }))}
          className="w-full sm:w-64"
        />

        <CButton
          onClick={handleDownloadPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <FaDownload /> Download Report
        </CButton>
      </div>

      <div className="bg-white p-4 md:p-6 border border-primary rounded-md shadow">
        <h2 className="text-base md:text-lg font-semibold mb-4 text-dark">
          Monthly Earnings ({selectedMonth})
        </h2>
        <div className="h-[250px] md:h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <PendingPaymentsSection
        rows={paginatedPending}
        page={pendingPage}
        totalPages={totalPendingPages}
        setPage={setPendingPage}
        onResend={handleResendPaymentLink}
        pendingSummary={pendingSummary}
        currentMonthPendingOnly={currentMonthPendingOnly}
      />

      <TableSection
        title="Earnings History"
        icon={<FaCalendarAlt className="text-green-500" />}
        headers={["Date", "PG Name", "Amount", "Status"]}
        rows={paginatedHistory.map((h) => [h.date, h.source, formatMoney(h.amount), h.status])}
        page={historyPage}
        totalPages={totalHistoryPages}
        setPage={setHistoryPage}
        status
      />
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-black text-white p-5 md:p-6 rounded-md flex justify-between items-center shadow">
    <div>
      <p className="text-base text-textLight uppercase tracking-wider">{title}</p>
      <p className="text-xl text-textLight font-bold mt-1">{value}</p>
    </div>
    <div className="text-orange-500 text-2xl md:text-3xl">{icon}</div>
  </div>
);

const PendingPaymentsSection = ({
  rows,
  page,
  totalPages,
  setPage,
  onResend,
  pendingSummary,
  currentMonthPendingOnly,
}) => (
  <div className="bg-white p-4 md:p-6 border border-primary rounded-md shadow">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 text-dark">
        <FaClock className="text-red-500" /> Pending Payments
      </h2>
      <div className="text-xs sm:text-sm text-right">
        <p className="font-semibold text-gray-700">
          Pending Total: <span className="text-red-700">{formatMoney(pendingSummary.totalAmount)}</span>
        </p>
        {currentMonthPendingOnly && <p className="text-orange-700">Current month only</p>}
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
          {rows.length > 0 ? rows.map((row) => (
            <tr key={row.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">{row.userName || row.tenant || "Unknown Tenant"}</td>
              <td className="py-4 px-4">{row.pg || "Unknown PG"}</td>
              <td className="py-4 px-4 font-semibold">{formatMoney(row.amount)}</td>
              <td className="py-4 px-4 text-red-600 font-semibold">{formatMoney(row.lateFee)}</td>
              <td className="py-4 px-4">{row.actualDueDate || row.due || "-"}</td>
              <td className="py-4 px-4 text-red-700 font-bold">{formatMoney(row.totalAmount)}</td>
              <td className="py-4 px-4 text-center">
                <button
                  onClick={() => onResend(row.bookingId || row.id, row.userName || row.tenant)}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-orange-200 text-[#D97706] hover:bg-[#FEF3C7] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!(row.bookingId || row.id)}
                  title="Resend Payment Link"
                >
                  <FaRegPaperPlane size={14} />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-400">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-4">
      {rows.length > 0 ? rows.map((row) => (
        <div key={row.id} className="border rounded-md p-4 space-y-2 bg-gray-50">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase">{row.userName || row.tenant || "Unknown Tenant"}</span>
            <span className="text-xs text-gray-500">{row.actualDueDate || row.due || "-"}</span>
          </div>
          <div className="text-sm font-semibold">{row.pg || "Unknown PG"}</div>
          <div className="text-xs text-gray-500">Amount: {formatMoney(row.amount)}</div>
          <div className="text-xs text-red-600 font-semibold">Late Fee: {formatMoney(row.lateFee)}</div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-bold text-red-700">Total: {formatMoney(row.totalAmount)}</span>
            <button
              onClick={() => onResend(row.bookingId || row.id, row.userName || row.tenant)}
              className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-orange-200 text-[#D97706] hover:bg-[#FEF3C7] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!(row.bookingId || row.id)}
            >
              Resend
            </button>
          </div>
        </div>
      )) : <div className="text-center py-4 text-gray-400 text-sm">No records found</div>}
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
);

const TableSection = ({ title, icon, headers, rows, page, totalPages, setPage, status }) => (
  <div className="bg-white p-4 md:p-6 border border-primary rounded-md shadow">
    <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-dark">
      {icon} {title}
    </h2>

    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`py-3 px-4 font-semibold ${i === headers.length - 1 ? "text-center" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, i) => (
            <tr key={i} className="border-b last:border-none hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-4 px-4 ${j === row.length - 2 ? "font-bold" : j === row.length - 1 ? "text-center" : ""}`}>
                  {status && j === row.length - 1 ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase">{cell}</span>
                  ) : cell}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={headers.length} className="py-8 text-center text-gray-400">No records found</td></tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-4">
      {rows.length > 0 ? rows.map((row, i) => (
        <div key={i} className="border rounded-md p-4 space-y-2 bg-gray-50">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase">{headers[0]}: {row[0]}</span>
            {status && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{row[3]}</span>}
          </div>
          <div className="text-sm font-semibold">{row[1]}</div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-xs text-gray-400">{row[3] && !status ? row[3] : ""}</span>
            <span className="text-sm font-bold">{row[2]}</span>
          </div>
        </div>
      )) : <div className="text-center py-4 text-gray-400 text-sm">No records found</div>}
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
);

export default TotalEarnings;
