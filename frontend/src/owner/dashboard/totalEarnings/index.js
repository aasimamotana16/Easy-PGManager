import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaCalendarAlt,
  FaDownload,
  FaClock,
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import Swal from "sweetalert2";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ITEMS_PER_PAGE = 2;

const TotalEarnings = () => {
  const [selectedMonth, setSelectedMonth] = useState("Jan");
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          setEarningsData({
            stats: { total: 0, monthly: 0, today: 0 },
            chartData: { labels: [], datasets: [] },
            earningsHistory: [],
            pendingPayments: []
          });
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:5000/api/owner/earnings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setEarningsData(response.data.data);
        }
      } catch (error) {
        setEarningsData({
          stats: { total: 0, monthly: 0, today: 0 },
          chartData: { labels: [], datasets: [] },
          earningsHistory: [],
          pendingPayments: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const earningsStats = earningsData?.stats || { total: 0, monthly: 0, today: 0 };
  const chartData = earningsData?.chartData || { labels: [], datasets: [] };
  const earningsHistory = earningsData?.earningsHistory || [];
  const pendingPayments = earningsData?.pendingPayments || [];

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
      const response = await axios.get(`http://localhost:5000/api/owner/earnings/pdf?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Earnings_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      Swal.close();
    } catch (error) {
      // Fallback PDF generation logic (simplified here for brevity)
      const doc = new jsPDF();
      doc.text("Earnings Report", 14, 15);
      doc.save(`Earnings_Report_${selectedMonth}.pdf`);
      Swal.fire({ title: "Report Downloaded", text: "Local fallback generated.", icon: "info" });
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen space-y-6">
      
      {/* HEADER - Matched to Support Page */}
      <div className="flex items-center gap-3">
        <div>
<h1 className="text-2xl sm:text-4xl font-bold text-textPrimary">
          Earnings Overview
        </h1>          <p className="text-xs md:text-base text-gray-500">
            Track your income and pending payments
            {loading && <span className="ml-2 text-orange-500 animate-pulse">(Loading...)</span>}
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SummaryCard title="Total Earnings" value={`₹${earningsStats.total.toLocaleString()}`} icon={<FaMoneyBillWave />} />
        <SummaryCard title="This Month" value={`₹${earningsStats.monthly.toLocaleString()}`} icon={<FaArrowUp />} />
        <SummaryCard title="Today" value={`₹${earningsStats.today.toLocaleString()}`} icon={<FaCalendarAlt />} />
      </div>

      {/* FILTER + DOWNLOAD */}
      <div className="bg-white p-4 rounded-md shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
        <CSelect
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          options={["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m => ({ value: m, label: m }))}
          className="w-full sm:w-64"
        />

        <CButton
          onClick={handleDownloadPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <FaDownload /> Download Report
        </CButton>
      </div>

      {/* GRAPH */}
      <div className="bg-white p-4 md:p-6 border border-primary rounded-md shadow">
        <h2 className="text-base md:text-lg font-semibold mb-4 text-dark">
          Monthly Earnings ({selectedMonth})
        </h2>
        <div className="h-[250px] md:h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* PENDING PAYMENTS */}
      <TableSection
        title="Pending Payments"
        icon={<FaClock className="text-red-500" />}
        headers={["Tenant", "PG", "Amount", "Due Date"]}
        rows={paginatedPending.map(p => [p.tenant, p.pg, `₹${p.amount.toLocaleString()}`, p.due])}
        page={pendingPage}
        totalPages={totalPendingPages}
        setPage={setPendingPage}
        amountColor="text-red-600"
      />

      {/* EARNINGS HISTORY */}
      <TableSection
        title="Earnings History"
        icon={<FaCalendarAlt className="text-green-500" />}
        headers={["Date", "PG Name", "Amount", "Status"]}
        rows={paginatedHistory.map(h => [h.date, h.source, `₹${h.amount.toLocaleString()}`, h.status])}
        page={historyPage}
        totalPages={totalHistoryPages}
        setPage={setHistoryPage}
        status
      />
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-black text-white p-5 md:p-6 rounded-md flex justify-between items-center shadow">
    <div>
      <p className="text-base  text-textLight uppercase tracking-wider">{title}</p>
      <p className="text-xl text-textLight font-bold mt-1">{value}</p>
    </div>
    <div className="text-orange-500 text-2xl md:text-3xl">{icon}</div>
  </div>
);

const TableSection = ({ title, icon, headers, rows, page, totalPages, setPage, amountColor, status }) => (
  <div className="bg-white p-4 md:p-6 border  border-primary rounded-md shadow">
    <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-dark">
      {icon} {title}
    </h2>

    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50  text-gray-500">
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
                <td key={j} className={`py-4 px-4 ${j === row.length - 2 ? `font-bold ${amountColor || ""}` : j === row.length - 1 ? "text-center" : ""}`}>
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

    {/* Mobile View (Cards) */}
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
             <span className={`text-sm font-bold ${amountColor || "text-dark"}`}>{row[2]}</span>
          </div>
        </div>
      )) : <div className="text-center py-4 text-gray-400 text-sm">No records found</div>}
    </div>

    {/* PAGINATION */}
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
