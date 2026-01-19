import React, { useState } from "react";
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

  /* ---------------- DATA ---------------- */

  const earningsStats = {
    total: 125000,
    monthly: 32000,
    today: 4500,
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Earnings",
        data: [15000, 18000, 21000, 24000, 26000, 30000, 32000],
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.15)",
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#e5e7eb" } },
    },
  };

  const earningsHistory = [
    { date: "05 Jan 2026", source: "Shree Residency", amount: 8500, status: "Paid" },
    { date: "03 Jan 2026", source: "Krishna PG", amount: 7000, status: "Paid" },
    { date: "01 Jan 2026", source: "Om Sai PG", amount: 6500, status: "Paid" },
  ];

  const pendingPayments = [
    { tenant: "Amit Patel", pg: "Shree Residency", amount: 9000, due: "15 Jan 2026" },
    { tenant: "Riya Shah", pg: "Om Sai PG", amount: 7500, due: "18 Jan 2026" },
  ];

  /* ---------------- PAGINATION ---------------- */

  const paginate = (data, page) =>
    data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const paginatedPending = paginate(pendingPayments, pendingPage);
  const paginatedHistory = paginate(earningsHistory, historyPage);

  const totalPendingPages = Math.ceil(pendingPayments.length / ITEMS_PER_PAGE);
  const totalHistoryPages = Math.ceil(earningsHistory.length / ITEMS_PER_PAGE);

  /* ---------------- PDF DOWNLOAD ---------------- */

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("EasyPG Manager - Earnings Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Month: ${selectedMonth}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Earnings", `Rs. ${earningsStats.total.toLocaleString()}`],
        ["This Month", `Rs. ${earningsStats.monthly.toLocaleString()}`],
        ["Today", `Rs. ${earningsStats.today.toLocaleString()}`],
      ],
    });

    doc.text("Pending Payments", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Tenant", "PG", "Amount", "Due Date"]],
      body: pendingPayments.map(p => [
        p.tenant,
        p.pg,
        `Rs. ${p.amount.toLocaleString()}`,
        p.due,
      ]),
    });

    doc.text("Earnings History", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Date", "PG Name", "Amount", "Status"]],
      body: earningsHistory.map(e => [
        e.date,
        e.source,
        `Rs. ${e.amount.toLocaleString()}`,
        e.status,
      ]),
    });

    doc.save(`Earnings_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Earnings Overview</h1>
        <p className="text-gray-500">
          Track your income, pending payments and reports
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Total Earnings" value={`₹${earningsStats.total.toLocaleString()}`} icon={<FaMoneyBillWave />} />
        <SummaryCard title="This Month" value={`₹${earningsStats.monthly.toLocaleString()}`} icon={<FaArrowUp />} />
        <SummaryCard title="Today" value={`₹${earningsStats.today.toLocaleString()}`} icon={<FaCalendarAlt />} />
      </div>

      {/* FILTER + DOWNLOAD */}
      <div className="bg-white p-4 rounded-md shadow flex justify-between items-center">
        <select
          className="border rounded-lg px-4 py-2"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md"
        >
          <FaDownload /> Download Report (PDF)
        </button>
      </div>

      {/* GRAPH */}
      <div className="bg-white p-6 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Earnings ({selectedMonth})
        </h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* PENDING PAYMENTS */}
      <TableSection
        title="Pending Payments"
        icon={<FaClock />}
        headers={["Tenant", "PG", "Amount", "Due Date"]}
        rows={paginatedPending.map(p => [
          p.tenant,
          p.pg,
          `₹${p.amount.toLocaleString()}`,
          p.due
        ])}
        page={pendingPage}
        totalPages={totalPendingPages}
        setPage={setPendingPage}
        amountColor="text-red-600"
      />

      {/* EARNINGS HISTORY */}
      <TableSection
        title="Earnings History"
        headers={["Date", "PG Name", "Amount", "Status"]}
        rows={paginatedHistory.map(h => [
          h.date,
          h.source,
          `₹${h.amount.toLocaleString()}`,
          h.status
        ])}
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
  <div className="bg-black text-white p-6 rounded-md flex justify-between items-center shadow">
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className="text-orange-500 text-2xl">{icon}</div>
  </div>
);

const TableSection = ({
  title,
  icon,
  headers,
  rows,
  page,
  totalPages,
  setPage,
  amountColor,
  status,
}) => (
  <div className="bg-white p-6 rounded-md shadow">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {icon} {title}
    </h2>

    <table className="w-full table-fixed text-sm">
      <thead className="border-b text-gray-500">
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className={`py-3 px-4 ${
                i === headers.length - 2
                  ? "text-right"
                  : i === headers.length - 1
                  ? "text-center"
                  : "text-left"
              }`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b last:border-none">
            {row.map((cell, j) => (
              <td
                key={j}
                className={`py-4 px-4 ${
                  j === row.length - 2
                    ? `text-right font-semibold ${amountColor || ""}`
                    : j === row.length - 1
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {status && j === row.length - 1 ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-semibold">
                    {cell}
                  </span>
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* PAGINATION */}
    <div className="flex justify-end gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-3 py-1">
        {page} / {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);

export default TotalEarnings;
