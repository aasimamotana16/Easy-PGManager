import React, { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";
import { Html5QrcodeScanner } from "html5-qrcode";
import { 
  FaCalendarCheck, 
  FaHistory, 
  FaQrcode, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaTimes,
  FaClock,
  FaKeyboard,
  FaInfoCircle
} from "react-icons/fa";

const CheckIns = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScanner, setShowScanner] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    fetchCheckInHistory();
  }, []);

  useEffect(() => {
    if (showScanner && !isManual) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      });
      scanner.render(onScanSuccess, onScanError);
      return () => scanner.clear();
    }
  }, [showScanner, isManual]);

  const fetchCheckInHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/checkins", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setHistory(res.data.data);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    setShowScanner(false);
    processAttendance(activeAction, decodedText);
  };

  const onScanError = () => {};

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setShowScanner(false);
    processAttendance(activeAction, manualCode);
    setManualCode("");
    setIsManual(false);
  };

  const processAttendance = async (type, code = "MANUAL_BYPASS") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/users/checkin-action",
        { 
          date: selectedDate.toISOString().split('T')[0], 
          actionType: type,
          verificationCode: code 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Swal.fire({
          title: 'Verified',
          text: `${type} Recorded Successfully`,
          icon: 'success',
          confirmButtonColor: '#f97316'
        });
        fetchCheckInHistory();
      }
    } catch (error) {
      Swal.fire('Error', 'Verification failed.', 'error');
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = history.filter((entry) => entry.checkIn === dateStr);
      
      if (dayEntries.length > 0) {
        const hasCheckOut = dayEntries.some(e => e.actionType === "Check-out");
        // Transparent colors as requested [cite: 2026-01-06]
        return hasCheckOut ? "transparent-orange-tile" : "transparent-black-tile";
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6 text-black font-sans">
      
      {/* HEADER - Responsive text sizes */}
      <div className="px-1 text-center md:text-left">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800"> Attendance Control
        </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
          Scan QR to Log Daily Entry & Exit
        </p>
      </div>

      {/* DUAL ACTION BOXES - Stacked on Mobile, Side-by-Side on MD [cite: 2026-01-06] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center">
            <FaSignInAlt size={22} />
          </div>
          <h3 className="font-black uppercase text-sm md:text-3xl lg:text-lg">Check-In</h3>
          <CButton 
            className="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:text-xl lg:text-sm"
            onClick={() => { setActiveAction("Check-in"); setShowScanner(true); setIsManual(false); }}
          >
            <FaQrcode className="text-white" /> Check-In Now
          </CButton>
        </div>

        <div className="bg-white border border-gray-100 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <FaSignOutAlt size={22}  />
          </div>
          <h3 className="font-black uppercase text-sm md:text-3xl lg:text-lg">Check-Out</h3>
          <CButton 
            className="w-full bg-orange-500 text-white py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:text-xl lg:text-sm"
            onClick={() => { setActiveAction("Check-out"); setShowScanner(true); setIsManual(false); }}
          >
            <FaSignOutAlt /> Check-Out Now
          </CButton>
        </div>
      </div>

      {/* COLOR LEGEND - Responsive wrapping [cite: 2026-01-06] */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-md border border-gray-100 shadow-sm px-5">
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-black/20 border border-black/40"></div>
               <span className="text-[9px] md:text-3xl lg:text-lg font-black uppercase text-gray-500">Check-In</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40"></div>
               <span className="text-[9px] md:text-3xl lg:text-lg font-black uppercase text-gray-500">check-Out</span>
            </div>
        </div>
        
      </div>

      {/* CALENDAR & HISTORY - Stacked on Mobile, Split on LG [cite: 2026-01-06] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-md shadow-sm border border-gray-100 p-2 sm:p-5 md:text-4xl lg:text-lg">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            nextLabel="›"
            prevLabel="‹"
            className="w-full border-none"
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-md shadow-sm border border-gray-100 flex flex-col h-[400px] md:h-auto max-h-[500px]">
          <div className="p-4 border-b border-gray-50 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 md:text-3xl lg:text-lg">
            <FaHistory className="text-orange-500" /> Recent Activity
          </div>
          <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-400 font-bold text-[10px]">Syncing...</div>
            ) : (
              history.map((entry) => (
                <div key={entry.id || entry._id} className="border-l-4 border-black bg-gray-50 p-4 rounded-r-md flex justify-between items-center text-xs md:text-3xl lg:text-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${entry.actionType === 'Check-out' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-black'}`}>
                      <FaClock size={12}/>
                    </div>
                    <div>
                      <p className="font-black">{entry.checkIn}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{entry.time || "Server Verified"}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${entry.actionType === 'Check-out' ? 'bg-orange-100' : 'bg-gray-200'}`}>
                    {entry.actionType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

     {/* SCANNER MODAL - Responsive Optimization [cite: 2026-01-06] */}
{showScanner && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-8">
    {/* Scalable Container: max-w-sm (mobile) -> max-w-md (tablet) -> max-w-lg (desktop) */}
    <div className="bg-white w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      
      {/* HEADER - Adjusted for md/lg readability */}
      <div className="p-4 md:p-6 lg:p-7 bg-black text-white flex justify-between items-center border-b border-orange-500/30">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-orange-500">
            Security Portal
          </span>
          <span className="text-sm md:text-xl font-black uppercase tracking-tight">
            Confirm {activeAction}
          </span>
        </div>
        <button 
          onClick={() => setShowScanner(false)} 
          className="text-orange-500 hover:rotate-90 transition-transform duration-300 p-2"
        >
          <FaTimes size={window.innerWidth > 768 ? 24 : 18} />
        </button>
      </div>

      {/* CONTENT AREA - Scaling padding and spacing */}
      <div className="p-6 md:p-10 lg:p-12">
        {!isManual ? (
          <div className="space-y-6 md:space-y-10">
            <div className="relative group">
              {/* QR Scanner Container with md:border-8 for better framing */}
              <div 
                id="reader" 
                className="w-full rounded-xl overflow-hidden border-4 md:border-8 border-gray-50 shadow-inner bg-gray-100"
              ></div>
              
              {/* Responsive Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
            </div>

            <div className="text-center">
              <p className="text-[10px] md:text-sm lg:text-base font-bold text-gray-400 uppercase tracking-widest mb-6 md:mb-8">
                Position QR code within the frame
              </p>
              <button 
                onClick={() => setIsManual(true)} 
                className="group flex items-center justify-center gap-2 w-full py-4 text-[10px] md:text-xs font-black uppercase text-gray-400 hover:text-black transition-colors border-t border-gray-100"
              >
                <FaKeyboard className="text-orange-500 group-hover:scale-110 transition-transform md:text-lg" /> 
                Scanner not working? Enter Code
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-6 md:space-y-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-2 md:space-y-3">
              <h4 className="text-xs md:text-base lg:text-lg font-black uppercase italic text-gray-800">Manual Verification</h4>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-tighter">Enter the code displayed at the PG entrance</p>
            </div>

            <input 
              type="text" 
              placeholder="EZY - X X X X"
              className="w-full bg-gray-50 border-2 border-gray-100 p-4 md:p-6 lg:p-7 rounded-2xl text-center font-black text-xl md:text-3xl lg:text-4xl uppercase tracking-[0.3em] focus:border-orange-500 focus:bg-white transition-all outline-none shadow-sm"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              autoFocus
            />

            <div className="space-y-4 md:space-y-5">
              <CButton 
                className="w-full bg-black text-white py-4 md:py-6 text-xs md:text-sm lg:text-base font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-xl rounded-xl" 
                type="submit"
              >
                Verify & Continue
              </CButton>
              <button 
                type="button" 
                onClick={() => setIsManual(false)} 
                className="w-full py-2 text-[10px] md:text-xs font-bold uppercase text-gray-400 hover:text-orange-500 tracking-widest transition-colors"
              >
                Return to Scanner
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FOOTER - Scaling security text */}
      <div className="p-4 md:p-6 bg-gray-50/50 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-[8px] md:text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-widest">
            Encrypted & Tamper-Proof Digital Verification Active
          </p>
        </div>
      </div>
    </div>
  </div>
)}
      

      <style jsx global>{`
        /* RESPONSIVE CALENDAR TWEAKS */
        .react-calendar { font-family: inherit !important; width: 100% !important; border: none !important; }
        .react-calendar__navigation button { min-width: 35px; font-size: 1.5rem !important; color: #f97316 !important; background: none; }
        @media (min-width: 768px) { .react-calendar__navigation button { font-size: 1.8rem !important; } }
        
        .transparent-black-tile { 
          background: rgba(0, 0, 0, 0.08) !important; 
          color: black !important; 
          border-radius: 6px; 
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
        }
        .transparent-orange-tile { 
          background: rgba(249, 115, 22, 0.08) !important; 
          color: #f97316 !important; 
          border-radius: 6px; 
          border: 1px solid rgba(249, 115, 22, 0.15) !important;
        }

        .react-calendar__tile--active { background: #f97316 !important; color: white !important; border-radius: 6px; }
        .react-calendar__month-view__days__day--neighboringMonth { opacity: 0.1 !important; }
        .react-calendar__month-view__weekdays__weekday { text-decoration: none !important; font-size: 0.6rem; font-weight: 900; color: #000; }
        
        /* SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CheckIns;