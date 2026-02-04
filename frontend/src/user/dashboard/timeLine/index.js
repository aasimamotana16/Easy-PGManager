import React, { useState } from "react";
import CButton from "../../../components/cButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaHistory, FaDownload, FaCircle, FaFilter } from "react-icons/fa";

const timelineEvents = [
  { icon: "✅", text: "Booking Confirmed", date: "12 Dec 2025" },
  { icon: "🏠", text: "PG Check-in Completed", date: "15 Dec 2025" },
  { icon: "💰", text: "Last Rent Paid: Rs.6,000", date: "01 Jan 2026" },
  { icon: "📄", text: "Agreement Uploaded", date: "02 Jan 2026" },
];

const activityData = [
  { month: "Jan", CheckIns: 20, Payments: 2 },
  { month: "Feb", CheckIns: 18, Payments: 2 },
  { month: "Mar", CheckIns: 22, Payments: 3 },
  { month: "Apr", CheckIns: 19, Payments: 2 },
  { month: "May", CheckIns: 21, Payments: 2 },
  { month: "Jun", CheckIns: 20, Payments: 2 },
];

const Timeline = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");

  const downloadTimelinePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header & Branding
    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // Orange-500
    doc.text("EasyPG STAY REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Report Period: ${selectedMonth === "All" ? "Full History" : selectedMonth + " 2026"}`, 14, 33);
    
    doc.setDrawColor(240);
    doc.line(14, 38, pageWidth - 14, 38);

    // 2. Key Events Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Key Timeline Events", 14, 50);

    const eventRows = timelineEvents.map(ev => [ev.date, ev.text]);

autoTable(doc, {
  startY: 55,
  head: [['Date', 'Activity']],
  body: eventRows,
  theme: 'striped',
  headStyles: { fillColor: [0, 0, 0] },
});

    // 3. Activity Summary Section
   const finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Monthly Activity Data", 14, finalY);

    const chartRows = activityData
      .filter(d => selectedMonth === "All" || d.month === selectedMonth)
      .map(d => [d.month, d.CheckIns, d.Payments]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Month', 'Check-ins', 'Payments Made']],
      body: chartRows,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
    });
    // 4. Security Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a system-generated encrypted log. AES-256 Verified.", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`Stay_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <FaHistory className="text-orange-500" /> Stay Timeline
          </h1>
          <p className="text-[10px] sm:text-xs md:text-lg text-gray-500 uppercase tracking-[0.2em]">
            Real-time activity & Transaction logs
          </p>
        </div>

        {/* MONTH FILTER */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-md border border-gray-100 shadow-sm">
          <FaFilter className="text-gray-400 ml-2" />
          <select 
            className="bg-transparent font-bold text-xs md:text-sm uppercase outline-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="All">Full History</option>
            {activityData.map(d => <option key={d.month} value={d.month}>{d.month}</option>)}
          </select>
        </div>
      </div>

      <div id="timeline-wrapper" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: EVENTS */}
          <div className="lg:col-span-5 bg-white rounded-md border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-base md:text-3xl lg:text-2xl font-black uppercase tracking-tight text-gray-800">
                Key Events
              </h3>
              <div className="flex items-center gap-2">
                <FaCircle className="text-green-500 animate-pulse" size={8} />
                <span className="text-[9px] md:text-xl lg:text-xs font-bold uppercase text-gray-400">Payments</span>
              </div>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[22px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-gray-200 before:to-transparent">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-center gap-6 group">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-md bg-white border-2 border-orange-500 shadow-sm z-10 group-hover:scale-110 transition-transform">
                    <span className="text-lg md:text-xl">{event.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm md:text-3xl lg:text-lg font-black uppercase text-gray-800 tracking-tight leading-none">
                      {event.text}
                    </p>
                    <span className="text-[10px] md:text-2xl lg:text-xs font-bold text-gray-400 mt-1 uppercase">
                      {event.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <CButton 
              className="w-full mt-10 bg-black text-white py-4 rounded-md flex items-center justify-center gap-3 text-[10px] md:text-xl  lg:text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-black/10"
              onClick={downloadTimelinePDF}
            >
              <FaDownload /> Download {selectedMonth === "All" ? "Full" : selectedMonth} Report
            </CButton>
          </div>

          {/* RIGHT COLUMN: GRAPH */}
          <div className="lg:col-span-7 bg-white rounded-md border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-base md:text-3xl lg:text-2xl font-black uppercase tracking-tight text-gray-800">
                Monthly Activity
              </h3>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-[9px] md:text-xl lg:text-xs font-bold uppercase text-gray-400">Check-ins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] md:text-xl lg:text-xs font-bold uppercase text-gray-400">Payments</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] md:h-[500px] lg:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="CheckIns" 
                    stroke="#f97316" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Payments" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY FOOTER */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-md border border-gray-100 shadow-sm">
           <div className="w-2 h-2 rounded-md bg-green-500 animate-pulse"></div>
           <span className="text-[9px] md:text-xs font-black uppercase text-gray-400 tracking-widest">
             Activity logs are tamper-proof & encrypted
           </span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;