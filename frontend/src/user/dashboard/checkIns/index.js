import React, { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";
import { 
  FaHistory, 
  FaQrcode, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaTimes,
  FaClock,
} from "react-icons/fa";

const CheckIns = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScanner, setShowScanner] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [processing, setProcessing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;
  const authToken = localStorage.getItem("userToken");

  useEffect(() => {
    if (authToken) {
      fetchCheckInHistory();
    }
  }, [authToken]);

  const fetchCheckInHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/my-checkins", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data.success) setHistory(res.data.data);
    } catch (error) {
      console.error("History fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSecurityAction = async (e) => {
    if (e) e.preventDefault();
    
    if (isPastDate(selectedDate)) {
      return Swal.fire({
        title: 'Action Denied',
        text: 'You cannot perform check-in or check-out for past dates.',
        icon: 'error',
        confirmButtonColor: '#000000'
      });
    }

    if (processing) return;
    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };

      if (!isOtpSent) {
        const res = await axios.post("http://localhost:5000/api/users/send-otp", 
          { email: userEmail, recaptchaToken: captchaToken },
          config
        );
        setIsOtpSent(true);
        if (res.data.otp) {
          Swal.fire({ 
            title: 'OTP Generated', 
            html: `Your security code is: <strong>${res.data.otp}</strong><br><small>Use this to complete your check-in/out</small>`, 
            icon: 'info' 
          });
        }
      } else {
        const res = await axios.post("http://localhost:5000/api/users/verify-security", 
          { email: userEmail, otp, type: activeAction },
          config
        );

        if (res.data.success) {
          Swal.fire({ title: 'Verified', text: `${activeAction} Successful`, icon: 'success' });
          closeModal();
          fetchCheckInHistory();
        }
      }
    } catch (error) {
      setCaptchaToken(null); 
      Swal.fire('Error', error.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setShowScanner(false);
    setIsOtpSent(false);
    setOtp("");
    setCaptchaToken(null);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = history.filter((entry) => {
        const rawDate = entry.checkInDate || entry.createdAt || entry.date;
        if (!rawDate) return false;
        const entryDateObj = new Date(rawDate);
        if (isNaN(entryDateObj.getTime())) return false;
        return entryDateObj.toISOString().split('T')[0] === dateStr;
      });

      if (dayEntries.length > 0) {
        const hasCheckOut = dayEntries.some(e => {
            const type = (e.activityType || e.actionType || "").toLowerCase();
            return type.includes("out") || e.status === "Completed";
        });
        return hasCheckOut ? "transparent-orange-tile" : "transparent-black-tile";
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-black">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="px-1 text-center md:text-left">
          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800"> Attendance Control</h1>
          <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
            Verify Security Code to Log Daily Entry & Exit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center">
              <FaSignInAlt size={22} />
            </div>
            <h3 className="font-black uppercase text-sm md:text-3xl lg:text-lg">Check-In</h3>
            <CButton 
              className="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:text-xl lg:text-sm"
              onClick={() => { setActiveAction("Check-In"); setShowScanner(true); }}
            >
              <FaQrcode className="text-white" /> Check-In Now
            </CButton>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <FaSignOutAlt size={22}  />
            </div>
            <h3 className="font-black uppercase text-sm md:text-3xl lg:text-lg">Check-Out</h3>
            <CButton 
              className="w-full bg-orange-500 text-white py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:text-xl lg:text-sm"
              onClick={() => { setActiveAction("Check-Out"); setShowScanner(true); }}
            >
              <FaSignOutAlt /> Check-Out Now
            </CButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-md shadow-sm border border-gray-200 p-2 sm:p-5">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              className="w-full border-none"
            />
          </div>

          <div className="lg:col-span-5 bg-white rounded-md shadow-sm border border-gray-200 flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              <FaHistory className="text-orange-500" /> Recent Activity
            </div>
            <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-grow">
              {loading ? (
                <div className="text-center py-10 animate-pulse text-gray-400">Syncing...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">No records found</div>
              ) : (
                history.map((entry) => {
                  const rawDate = entry.checkInDate || entry.createdAt || entry.date;
                  const dateObj = new Date(rawDate);
                  const isValid = rawDate && !isNaN(dateObj.getTime());

                  const formattedDate = isValid 
                    ? dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : "Invalid Date";

                  const formattedTime = isValid 
                    ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                    : "--:--";

                  const typeValue = (entry.activityType || entry.actionType || "").toLowerCase();
                  const isCheckOut = typeValue.includes("out") || entry.status === "Completed";

                  return (
                    <div key={entry.id || entry._id} className="border-l-4 border-black bg-gray-50 p-4 rounded-r-md flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${isCheckOut ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-black'}`}>
                          <FaClock size={12}/>
                        </div>
                        <div>
                          <p className="font-black">{formattedDate}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{formattedTime}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isCheckOut ? 'bg-orange-100' : 'bg-gray-200'}`}>
                        {entry.activityType || entry.actionType || (isCheckOut ? "Check-Out" : "Check-In")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white w-[90%] max-w-md rounded-2xl overflow-hidden shadow-2xl z-10">
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-tight">Security Portal: {activeAction}</span>
              <button onClick={closeModal} className="text-orange-500 hover:text-orange-400 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-8">
              <form onSubmit={handleSecurityAction} className="space-y-6 text-center">
                {!isOtpSent ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="inline-block bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <ReCAPTCHA
                        sitekey="6LfT_lksAAAAAOanKI3_z06JdciUMm5vg3emlZgL"
                        onChange={(token) => setCaptchaToken(token)}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Confirm you are human to receive code</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-800">Enter Security Code</h4>
                    <input 
                      type="text" 
                      placeholder="· · · · · ·"
                      className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl text-center font-black text-2xl tracking-[0.3em] focus:border-orange-500 focus:bg-white transition-all outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}
                <CButton 
                  className={` font-black uppercase tracking-widest transition-all ${isPastDate(selectedDate) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white shadow-lg'}`}
                  type="submit"
                  disabled={(!captchaToken && !isOtpSent) || processing || isPastDate(selectedDate)}
                >
                  {processing ? "Processing..." : (isOtpSent ? `Verify & ${activeAction}` : "Get Security Code")}
                </CButton>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .react-calendar { width: 100% !important; border: none !important; background: transparent !important; }
        .transparent-black-tile { background: rgba(0, 0, 0, 0.08) !important; color: black !important; border-radius: 6px; }
        .transparent-orange-tile { background: rgba(249, 115, 22, 0.08) !important; color: #f97316 !important; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .react-calendar__tile--now { background: #fff7ed !important; color: #f97316 !important; font-weight: bold; border-radius: 6px; }
        .react-calendar__tile--active { background: #000 !important; color: #fff !important; border-radius: 6px; }
      `}</style>
    </div>
  );
};

export default CheckIns;