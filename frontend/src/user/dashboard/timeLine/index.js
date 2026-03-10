import React, { useState, useEffect } from "react";
import CButton from "../../../components/cButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload, FaCircle, FaFilter } from "react-icons/fa";
import axios from "axios";
import { API_BASE } from "../../../config/apiBaseUrl";

const Timeline = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const token = localStorage.getItem("userToken");
        
        if (token) {
          const response = await axios.get(`${API_BASE}/users/timeline`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setTimelineData(response.data.data);
            setLoading(false);
            return; // Success, so we stop here
          }
        }
      } catch (error) {
        console.error("Backend fetch failed:", error);
        setTimelineData({
          keyEvents: [],
          chartData: {
            months: [],
            checkins: [],
            payments: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
      </div>
    );
  }

 // Transform backend data for frontend use
  // Transform backend data for frontend use
const timelineEvents = timelineData?.keyEvents?.map(event => {
  const parsedDate = event.date ? new Date(event.date) : null;
  const dateOnly = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Pending";

  return {
    icon: event.type === "booking" ? "✅" : 
          event.type === "checkin" ? "🏠" : 
          event.type === "checkout" ? "🚪" :
          event.type === "payment" ? "💰" : "📄",
    text: event.title, // This stays "Checked In" or "Checked Out"
    date: dateOnly,    // This is now just the date, no 12:00
    status: event.status || "Completed" // This keeps the status (Confirmed, Paid, etc.)
  };
}) || [];

  const activityData = timelineData?.chartData?.months?.map((month, index) => ({
    month: month,
    CheckIns: timelineData.chartData.checkins[index] || 0,
    Payments: timelineData.chartData.payments[index] || 0
  })) || [];
  const filteredActivityData = selectedMonth === "All"
    ? activityData
    : activityData.filter((row) => row.month === selectedMonth);
  const filteredTimelineEvents = selectedMonth === "All"
    ? timelineEvents
    : timelineEvents.filter((event) => {
        const parts = String(event.date || "").split(" ");
        return parts[1] === selectedMonth;
      });
const downloadTimelinePDF = async () => {
  try {
    const token = localStorage.getItem("userToken");
    
    // ✅ Change: Added ?month query parameter to the URL
    const response = await axios.get(`${API_BASE}/users/download-report?month=${selectedMonth}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', 
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Keep the filename dynamic as well
    link.setAttribute('download', `Stay_Report_${selectedMonth}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
      console.error("Official PDF failed, using local generator:", error);
      
      // Keep your original PDF code here as a fallback!
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22);
      doc.text("EasyPG STAY REPORT (Local)", 14, 20);
      
      const eventRows = filteredTimelineEvents.map(ev => [ev.date, ev.text]);
      autoTable(doc, {
        startY: 35,
        head: [['Date', 'Activity']],
        body: eventRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
      });
      
      doc.save(`Stay_Report_${selectedMonth}.pdf`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 bg-gray-200 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className=" flex  text-textPrimary">
             Stay Timeline
          </h2>
          <h3 className=" text-primary ">
            Real-time activity & Transaction logs
          </h3>
        </div>

        {/* MONTH FILTER */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-md border border-primary/30 shadow">
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
          <div className="lg:col-span-5 bg-white rounded-md border border-primary shadow p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">
                Key Events
              </h3>
              <div className="flex items-center gap-2">
                <FaCircle className="text-green-500 animate-pulse" size={8} />
                <span className="text-[9px] md:text-xl lg:text-xs font-bold uppercase text-gray-400">Payments</span>
              </div>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[22px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-gray-200 before:to-transparent">
              {filteredTimelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-center gap-6 group">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-md bg-white border border-orange-500 shadow-sm z-10 group-hover:scale-110 transition-transform">
                    <span className="text-lg md:text-xl">{event.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm md:text-3xl lg:text-lg font-black uppercase text-gray-800 tracking-tight leading-none">
                      {event.text}
                    </p>
                    <span className="text-[10px] md:text-2xl lg:text-xs font-bold text-gray-400 mt-1 uppercase">
                      {event.date} • {event.status}
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
          <div className="lg:col-span-7 bg-white rounded-md  shadow p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">
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
                <LineChart data={filteredActivityData}>
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
    </div>
  );
};

export default Timeline;
