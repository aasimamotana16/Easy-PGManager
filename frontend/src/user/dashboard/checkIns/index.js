import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CButton from "../../../components/cButton";
import axios from "axios";
import Swal from "sweetalert2";
import { requestExtension, requestMoveOut } from "../../../api/api";
import { 
  FaHistory, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaClock,
  FaCalendarCheck,
  FaMoneyCheckAlt
} from "react-icons/fa";

const CheckIns = () => {
  const navigate = useNavigate(); // Hook for redirection
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // States for Stay Management
  // Possible statuses: "Reserved" (only deposit paid), "PendingConfirmation" (rent paid, waiting for owner), "Active"
  const [stayStatus, setStayStatus] = useState("Reserved"); 
  const [joiningDate, setJoiningDate] = useState(null);
  const [rentAmount, setRentAmount] = useState(5000); 

  const user = JSON.parse(localStorage.getItem("user"));
  const authToken = localStorage.getItem("userToken");

  useEffect(() => {
    if (authToken) {
      fetchCheckInHistory();
      // Logic to fetch actual stay status from backend would go here
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

  // --- LOGIC: MOVE-IN (Redirect to Payment) ---
  const handleMoveIn = async () => {
    const result = await Swal.fire({
      title: 'Complete Your Move-In',
      html: `You need to pay the first month's rent of <b>₹${rentAmount}</b> to activate your stay.<br><br><small>You will be redirected to the secure payment page.</small>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#D97706', // primary
      confirmButtonText: 'Go to Payment',
      cancelButtonText: 'Later'
    });

    if (result.isConfirmed) {
      navigate('/user/dashboard/payments', {
        state: {
          amount: rentAmount,
          type: 'MOVE_IN_PAYMENT',
          reason: 'Move-In Activation'
        }
      });
    }
  };

  // --- LOGIC: MOVE-OUT (2-Month Penalty Rule) ---
  const handleMoveOut = () => {
    const today = new Date();
    // Logic to check if stay is less than 60 days
    const diffTime = joiningDate ? Math.abs(today - joiningDate) : 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let penaltyMessage = "";
    if (diffDays < 60) {
      penaltyMessage = `
        <div style="color: #B45309; background: #FEF3C7; padding: 12px; border-radius: 8px; margin-top: 15px; border: 1px solid #D97706; text-align: left; font-size: 14px;">
          <strong>Early Move-out Warning:</strong><br>
          You have stayed for only ${diffDays} days. As per policy (minimum 60 days), <b>1 month's rent (₹${rentAmount})</b> will be deducted as a fine.
        </div>`;
    }

    Swal.fire({
      title: 'Initiate Permanent Move-Out?',
      html: `Are you sure you want to end your stay permanently?${penaltyMessage}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1C1C1C',
      cancelButtonColor: '#4B4B4B',
      confirmButtonText: 'Confirm Move-Out'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resp = await requestMoveOut();

          if (resp.data?.earlyMoveOut) {
            Swal.fire({
              title: 'Move-Out Request Sent',
              html: `You have stayed only ${resp.data.daysStayed} days. Early move-out penalty can be <b>₹${resp.data.penalty}</b>. Owner will inspect and settle first.`,
              icon: 'warning',
              confirmButtonColor: '#D97706'
            });
          } else if (resp.data?.success) {
            Swal.fire({ title: 'Request Sent', text: resp.data.message || 'Move-out request sent to owner.', icon: 'success', confirmButtonColor: '#D97706' });
          } else {
            Swal.fire({ title: 'Error', text: resp.data?.message || 'Failed to move-out', icon: 'error', confirmButtonColor: '#D97706' });
          }
        } catch (e) {
          console.error('Move-out API error', e);
          Swal.fire({ title: 'Error', text: 'Failed to request move-out', icon: 'error', confirmButtonColor: '#D97706' });
        }
      }
    });
  };

  const handleExtension = () => {
    Swal.fire({
      title: 'Request Extension',
      html: `
        <div style="text-align:left;">
          <label style="font-size:12px;font-weight:600;">Pause fine till date</label>
          <input id="ext-date" type="date" class="swal2-input" />
          <textarea id="ext-reason" class="swal2-textarea" placeholder="Reason (optional)"></textarea>
          <p style="font-size:11px;color:#B45309;">Late fine is ₹100/day and will pause till selected date.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      preConfirm: () => {
        const untilDate = document.getElementById("ext-date")?.value;
        const reason = document.getElementById("ext-reason")?.value || "";
        if (!untilDate) {
          Swal.showValidationMessage("Please select extension date");
          return null;
        }
        return { untilDate, reason };
      }
    }).then(async (res) => {
      if (res.isConfirmed && res.value) {
        try {
          const apiRes = await requestExtension(res.value);
          Swal.fire({
            title: 'Request Sent',
            text: apiRes.data?.message || 'Extension request submitted',
            icon: 'success',
            confirmButtonColor: '#D97706'
          });
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Failed to request extension',
            icon: 'error',
            confirmButtonColor: '#D97706'
          });
        }
      }
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && joiningDate) {
      const dateStr = date.toISOString().split('T')[0];
      const joinStr = joiningDate.toISOString().split('T')[0];
      if (dateStr === joinStr) return "transparent-black-tile";
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-200 text-[#1C1C1C]">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="px-1 text-center md:text-left">
          <h2 className=" font-bold text-[#1C1C1C]">Stay Management</h2>
          <h3 className=" text-[#4B4B4B]">Manage your move-in, move-out, and billing history</h3>
        </div>

        {/* --- MAIN ACTION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* STATE 1: Reserved but Rent not paid */}
          {stayStatus === "Reserved" && (
            <div className="md:col-span-2 bg-white rounded-md p-8 shadow-sm border border-[#E5E0D9] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FEF3C7] text-[#D97706] rounded-full flex items-center justify-center mb-4">
                <FaMoneyCheckAlt size={30} />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Activate Your Stay</h2>
              <p className="text-[#4B4B4B] mb-6 max-w-sm">Your room is reserved. Please pay the first month's rent to enable Move-In and notify the owner.</p>
              <CButton onClick={handleMoveIn} className="max-w-md w-full py-4 text-lg font-bold shadow-md">
                Pay Rent & Move-In
              </CButton>
            </div>
          )}

          {/* STATE 2: Rent Paid, Waiting for Owner "Confirm Arrival" */}
          {stayStatus === "PendingConfirmation" && (
            <div className="md:col-span-2 bg-[#FEF3C7] rounded-md p-8 shadow-sm flex flex-col items-center text-center border-2 border-dashed border-[#D97706] animate-pulse">
              <FaClock size={40} className="text-[#D97706] mb-3" />
              <h2 className="text-xl font-bold uppercase text-[#B45309]">Awaiting Owner Confirmation</h2>
              <p className="text-[#B45309] max-w-sm">Payment successful! Please inform the owner to click <b>"Confirm Arrival"</b> in their app to activate your dashboard.</p>
            </div>
          )}

          {/* STATE 3: Fully Active Stay */}
          {stayStatus === "Active" && (
            <>
              <div className="bg-white rounded-md p-6 shadow-sm flex flex-col items-center space-y-4 border border-[#E5E0D9] border-l-4 border-green-500">
                <FaSignInAlt size={22} className="text-green-600" />
                <h3 className="font-bold uppercase text-sm">Stay Active</h3>
                <p className="text-xs text-[#4B4B4B]">Joined On: {joiningDate?.toLocaleDateString()}</p>
                <CButton onClick={handleExtension} className="w-full bg-[#1C1C1C] text-white py-3 text-[10px] font-bold uppercase tracking-widest">
                   Request Extension
                </CButton>
              </div>

              <div className="bg-white rounded-md p-6 shadow-sm flex flex-col items-center space-y-4 border border-[#E5E0D9] border-l-4 border-red-500">
                <FaSignOutAlt size={22} className="text-red-600" />
                <h3 className="font-bold uppercase text-sm">Permanent Move-Out</h3>
                <p className="text-xs text-[#4B4B4B]">End your stay and settle dues</p>
                <CButton onClick={handleMoveOut} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-[10px] font-bold uppercase tracking-widest">
                  Initiate Move-Out
                </CButton>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CALENDAR */}
          <div className="lg:col-span-7 bg-white rounded-md shadow-sm border border-[#E5E0D9] p-4 sm:p-6">
            <h3 className="pb-4 font-bold text-lg uppercase text-[#4B4B4B] flex items-center gap-2">
               <FaCalendarCheck className=" text-lg text-[#D97706]"/> Stay Calendar
            </h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              className="w-full border-none"
            />
          </div>

          {/* HISTORY */}
          <div className="lg:col-span-5 bg-white rounded-md shadow-sm border border-[#E5E0D9] flex flex-col h-[450px]">
            <div className="p-4 border-b border-[#E5E0D9] font-bold uppercase tracking-widest text-lg flex items-center gap-2">
              <FaHistory className=" text-lg text-[#D97706]" /> Previous Stay Records
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-grow custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-24">
                  <FaClock className="mx-auto text-[#E5E0D9] mb-2" size={40} />
                  <p className="text-[#4B4B4B] text-sm font-bold uppercase tracking-tighter">No History Found</p>
                </div>
              ) : (
                history.map((entry) => (
                   <div key={entry._id} className="border-l-4 border-[#1C1C1C] bg-gray-50 p-4 rounded-r-lg flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-md bg-[#FEF3C7] text-[#D97706]">
                            <FaClock size={12}/>
                         </div>
                         <div>
                            <p className="font-bold">{entry.pgName || "Nadiad PG"}</p>
                            <p className="text-sm text-[#4B4B4B]">{entry.date || "2026-02-15"}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#E5E0D9]">
                        Completed
                      </span>
                   </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar { width: 100% !important; border: none !important; font-family: inherit; }
        .transparent-black-tile { background: #D97706 !important; color: white !important; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E0D9; border-radius: 10px; }
        .react-calendar__tile--now { background: #FEF3C7 !important; color: #D97706 !important; font-weight: bold; border-radius: 8px; }
        .react-calendar__tile--active { background: #1C1C1C !important; color: #fff !important; border-radius: 8px; }
        .react-calendar__navigation button:enabled:hover { background-color: #FEF3C7; border-radius: 8px; }
      `}</style>
    </div>
  );
};

export default CheckIns;


