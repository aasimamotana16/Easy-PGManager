import React, { useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";

const CheckIns = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [history, setHistory] = useState([
    { checkOut: "2026-01-01", checkIn: "2026-01-03" },
    { checkOut: "2026-01-05", checkIn: "Pending" },
  ]);

  const handleCheckInOut = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      const last = history[history.length - 1];
      if (last && last.checkIn === "Pending") {
        last.checkIn = new Date().toISOString().slice(0, 10);
        setHistory([...history.slice(0, -1), last]);
      }
    } else {
      setCheckedIn(false);
      setHistory([...history, { checkOut: new Date().toISOString().slice(0, 10), checkIn: "Pending" }]);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      for (let entry of history) {
        const checkOut = new Date(entry.checkOut);
        const checkIn = entry.checkIn !== "Pending" ? new Date(entry.checkIn) : null;

        if (checkIn && date >= checkOut && date <= checkIn) {
          return "bg-green-1 text-green-2 font-semibold rounded";
        } else if (!checkIn && date >= checkOut) {
          return "bg-background-muted text-textSecondary font-medium rounded";
        }
      }
    }
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-2xl p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-primary">Check-ins</h2>
          <CButton className="bg-primary text-text-light px-5 py-2 rounded-xl" onClick={handleCheckInOut}>
            {checkedIn ? "Check Out" : "Check In"}
          </CButton>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CALENDAR CARD */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <Calendar
              tileClassName={tileClassName}
              showNeighboringMonth={false}
            />
            <p className="mt-2 text-sm text-text-muted">Green = Present, Gray = Out/Pending</p>
          </div>

          {/* HISTORY CARD */}
          <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-primary">Past Activities</h3>
            {history.map((entry, index) => (
              <div key={index} className="bg-cardSoft rounded-xl p-4">
                <p>
                  <span className="font-medium text-text-primary">Check Out:</span> {entry.checkOut}
                </p>
                <p>
                  <span className="font-medium text-text-primary">Check In:</span> {entry.checkIn}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckIns;
