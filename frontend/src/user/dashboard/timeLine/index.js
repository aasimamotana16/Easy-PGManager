import React from "react";
import CButton from "../../../components/cButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Timeline events
const timelineEvents = [
  { icon: "✅", text: "Booking Confirmed" },
  { icon: "🏠", text: "PG Check-in Completed" },
  { icon: "💰", text: "Last Rent Paid: ₹6,000" },
  { icon: "📄", text: "Agreement Uploaded" },
];

// Sample data for graph
const activityData = [
  { month: "Jan", CheckIns: 20, Payments: 2 },
  { month: "Feb", CheckIns: 18, Payments: 2 },
  { month: "Mar", CheckIns: 22, Payments: 3 },
  { month: "Apr", CheckIns: 19, Payments: 2 },
  { month: "May", CheckIns: 21, Payments: 2 },
  { month: "Jun", CheckIns: 20, Payments: 2 },
];

const Timeline = () => {

  // Function to download timeline as PDF
  const downloadTimeline = () => {
    const input = document.getElementById("timeline-wrapper");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("timeline.pdf");
    });
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div id="timeline-wrapper" className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">

        <h2 className="text-2xl font-semibold text-primary mb-4">Stay Timeline</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TIMELINE EVENTS */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h3 className="text-lg font-semibold text-primary mb-2">Key Events</h3>
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xl">{event.icon}</span>
                <p className="text-gray-700">{event.text}</p>
              </div>
            ))}

            <CButton 
              className=" px-5 py-2  mt-4"
              onClick={downloadTimeline}
            >
              Download Timeline
            </CButton>
          </div>

          {/* GRAPH */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Monthly Activity</h3>
            <p className="text-sm text-gray-500 mb-2">
              Orange = Check-ins, Green = Payments
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={activityData} 
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="CheckIns" stroke="#f97316" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Payments" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Timeline;
