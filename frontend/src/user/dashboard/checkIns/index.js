import React, { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios"; // Ensure axios is installed

const CheckIns = () => {
  // Use camelCase for state as per your preference [cite: 2026-01-01]
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Add this line

  // 1. Fetch real data from your new API [cite: 2026-01-06]
  const fetchCheckInHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/checkins", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckInHistory();
  }, []);

 const handleCheckIn = async () => {
  try {
    const token = localStorage.getItem("token");
    // Send the selected calendar date to the backend
    const res = await axios.post(
      "http://localhost:5000/api/users/checkin-action",
      { date: selectedDate }, // Update this line
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
      fetchCheckInHistory(); 
    }
  } catch (error) {
    alert("Check-in failed.");
  }
};

 const tileClassName = ({ date, view }) => {
  if (view === "month") {
    // 1. Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    // 2. Format as YYYY-MM-DD to match backend history
    const dateStr = `${year}-${month}-${day}`;
    
    // 3. Check if this date exists in history
    const hasEntry = history.some((entry) => entry.checkIn === dateStr);
    
    if (hasEntry) {
      // Use bold/distinct classes to override default calendar styles
      return "bg-green-1 text-green-2 font-bold rounded-lg !important";
    }
  }
};

  return (
    <div className="space-y-8">
      <div className="bg-dashboard-gradient rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-primary">Check-ins</h2>
          <CButton className="px-5 py-2" onClick={handleCheckIn}>
            Check In
          </CButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CALENDAR CARD */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <Calendar
              tileClassName={tileClassName}
              showNeighboringMonth={false}
            />
            <p className="mt-2 text-sm text-text-muted">Green = Present</p>
          </div>

          {/* HISTORY CARD - Now showing real data from Atlas */}
          <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-primary">Past Activities</h3>
            {loading ? (
              <p>Loading activities...</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="bg-cardSoft rounded-xl p-4">
                  <p>
                    <span className="font-medium text-text-primary">Check In Date:</span> {entry.checkIn}
                  </p>
                  <p>
                    <span className="font-medium text-text-primary">Status:</span> {entry.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIns;