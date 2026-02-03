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

  // Retrieve user and token [cite: 2026-01-06]
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;
  const authToken = localStorage.getItem("userToken"); // Updated to use userToken

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

  const handleSecurityAction = async (e) => {
    if (e) e.preventDefault();
    if (processing) return;

    setProcessing(true);

    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };

      if (!isOtpSent) {
        // Step 1: Send OTP [cite: 2026-01-06]
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
        } else {
          Swal.fire({ title: 'OTP Sent', text: 'Check your email for the code', icon: 'info' });
        }
      } else {
        // Step 2: Verify and Create Record [cite: 2026-01-07]
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
      setCaptchaToken(null); // Reset captcha on error
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
      const dayEntries = history.filter((entry) => entry.checkIn === dateStr);
      if (dayEntries.length > 0) {
        const hasCheckOut = dayEntries.some(e => e.actionType === "Check-out");
        return hasCheckOut ? "transparent-orange-tile" : "transparent-black-tile";
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6 text-black font-sans">
      
      <div className="px-1 text-center md:text-left">
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800"> Attendance Control</h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
          Verify Security Code to Log Daily Entry & Exit
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
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

        <div className="bg-white border border-gray-100 rounded-md p-6 shadow-sm flex flex-col items-center text-center space-y-4">
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
        <div className="lg:col-span-7 bg-white rounded-md shadow-sm border border-gray-100 p-2 sm:p-5">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="w-full border-none"
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-md shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-50 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
            <FaHistory className="text-orange-500" /> Recent Activity
          </div>
          <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-400">Syncing...</div>
            ) : (
              history.map((entry) => (
                <div key={entry.id || entry._id} className="border-l-4 border-black bg-gray-50 p-4 rounded-r-md flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${entry.actionType === 'Check-out' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-black'}`}>
                      <FaClock size={12}/>
                    </div>
                    <div>
                      <p className="font-black">{entry.checkIn}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{entry.time || "Verified"}</p>
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

      {showScanner && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <span className="text-sm font-black uppercase">Security Portal: {activeAction}</span>
              <button onClick={closeModal} className="text-orange-500"><FaTimes size={20} /></button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSecurityAction} className="space-y-6">
                {!isOtpSent ? (
                  <div className="flex flex-col items-center gap-4">
                    <ReCAPTCHA
                      sitekey="6LfT_lksAAAAAOanKI3_z06JdciUMm5vg3emlZgL"
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase text-center">
                      Confirm you are human to receive code
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <h4 className="text-xs font-black uppercase text-gray-800">Enter Security Code</h4>
                    <input 
                      type="text" 
                      placeholder="· · · · · ·"
                      className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl text-center font-black text-2xl tracking-[0.3em] focus:border-orange-500 outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}

                <CButton 
                  className="w-full bg-black text-white py-4 font-black uppercase tracking-widest rounded-xl disabled:opacity-50"
                  type="submit"
                  disabled={(!captchaToken && !isOtpSent) || processing}
                >
                  {processing ? "Processing..." : (isOtpSent ? `Verify & ${activeAction}` : "Get Security Code")}
                </CButton>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .react-calendar { width: 100% !important; border: none !important; }
        .transparent-black-tile { background: rgba(0, 0, 0, 0.08) !important; color: black !important; border-radius: 6px; }
        .transparent-orange-tile { background: rgba(249, 115, 22, 0.08) !important; color: #f97316 !important; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CheckIns;