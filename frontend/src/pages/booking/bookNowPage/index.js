import React, { useState, useContext, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BackendContext } from "../../../context/backendContext";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import Loader from "../../../components/loader";
import Swal from "sweetalert2";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pgList, loading: backendLoading } = useContext(BackendContext);

  const pg = pgList?.find((item) => String(item._id) === String(id));
  const isGirlsHostel = pg?.name?.toLowerCase().includes("girls");

  const today = new Date().toISOString().split("T")[0];

  const [persons, setPersons] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [paymentOption, setPaymentOption] = useState("deposit_only"); 

  const personRefs = useRef([]);

  const [personsData, setPersonsData] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
      gender: isGirlsHostel ? "Female" : "",
      emergencyName: "",
      emergencyPhone: "",
      institution: "",
      occupationRole: "",
    },
  ]);

  const [stayDetails, setStayDetails] = useState({
    checkIn: "",
    checkOut: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading || backendLoading) return <Loader />;
  if (!pg) return <div className="text-center mt-20 text-textPrimary">PG not found</div>;

  const selectedRoom = location.state?.selectedRoom || null;
  const roomTypeKey = String(selectedRoom?.type || "").toLowerCase();
  const parseNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const deriveRoomVariantPrice = () => {
    if (selectedRoom?.price) return parseNum(selectedRoom.price);
    if (Array.isArray(pg.roomPrices) && pg.roomPrices.length > 0) {
      const exact = pg.roomPrices.find((r) => {
        const key = String(r.variantName || r.variantLabel || r.roomType || r.type || "").toLowerCase();
        return roomTypeKey && (key === roomTypeKey || key.includes(roomTypeKey) || roomTypeKey.includes(key));
      });
      if (exact) return parseNum(exact.price || exact.rent || exact.pricePerMonth || exact.monthlyRent);
      return parseNum(pg.roomPrices[0]?.price || pg.roomPrices[0]?.rent || pg.roomPrices[0]?.pricePerMonth || pg.roomPrices[0]?.monthlyRent);
    }
    if (pg.roomPrices && typeof pg.roomPrices === "object") {
      if (roomTypeKey.includes("single")) return parseNum(pg.roomPrices.single);
      if (roomTypeKey.includes("double")) return parseNum(pg.roomPrices.double);
      if (roomTypeKey.includes("triple")) return parseNum(pg.roomPrices.triple);
      return parseNum(pg.roomPrices.other);
    }
    return 0;
  };
  const deriveRoomVariantDeposit = () => {
    if (selectedRoom?.securityDeposit) return parseNum(selectedRoom.securityDeposit);
    if (Array.isArray(pg.roomPrices) && pg.roomPrices.length > 0) {
      const exact = pg.roomPrices.find((r) => {
        const key = String(r.variantName || r.variantLabel || r.roomType || r.type || "").toLowerCase();
        return roomTypeKey && (key === roomTypeKey || key.includes(roomTypeKey) || roomTypeKey.includes(key));
      });
      if (exact) return parseNum(exact.securityDeposit || exact.deposit);
      return parseNum(pg.roomPrices[0]?.securityDeposit || pg.roomPrices[0]?.deposit);
    }
    return 0;
  };

  // Calculation Logic
  const pricePerPerson = deriveRoomVariantPrice() || Number(pg.startingPrice || pg.rent || pg.price || 0);
  const securityDepositPerPerson = deriveRoomVariantDeposit() || Number(pg.securityDeposit || pricePerPerson); 
  const maxBeds = pg.availableBeds || 5;
  
  const totalRent = pricePerPerson * persons;
  const totalDeposit = securityDepositPerPerson * persons;
  
  // FIXED: amountToPayNow now correctly switches based on selection
  const amountToPayNow = paymentOption === "full_payment" ? (totalRent + totalDeposit) : totalDeposit;

  const increase = () => {
    if (isSubmitted || persons >= maxBeds) return;
    const index = persons;
    setPersons(persons + 1);
    setPersonsData((prev) => [
      ...prev,
      {
        fullName: "", email: "", phone: "",
        gender: isGirlsHostel ? "Female" : "",
        emergencyName: "", emergencyPhone: "",
        institution: "", occupationRole: ""
      },
    ]);
    setTimeout(() => {
      personRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const decrease = () => {
    if (!isSubmitted && persons > 1) {
      setPersons(persons - 1);
      setPersonsData((prev) => prev.slice(0, -1));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...personsData];
    if (field === "phone" || field === "emergencyPhone") {
        const val = value.replace(/\D/g, "");
        if (val.length > 10) return;
        updated[index][field] = val;
    } else {
        updated[index][field] = value;
    }
    setPersonsData(updated);

    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[errorKey];
      setErrors(updatedErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    personsData.forEach((p, index) => {
      if (!p.fullName.trim()) newErrors[`fullName_${index}`] = "Full Name is required";
      if (!p.email || !/^\S+@\S+\.\S+$/.test(p.email)) newErrors[`email_${index}`] = "Valid email required";
      if (!p.phone || p.phone.length !== 10) newErrors[`phone_${index}`] = "10-digit phone required";
      if (!p.gender) newErrors[`gender_${index}`] = "Select gender";
      if (!p.institution.trim()) newErrors[`institution_${index}`] = "Institution required";
      if (!p.emergencyPhone || p.emergencyPhone.length !== 10) newErrors[`emergencyPhone_${index}`] = "Required";
    });

    if (!stayDetails.checkIn) newErrors.checkIn = "Check-in required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!validate()) {
      Swal.fire({ icon: 'error', title: 'Form Incomplete', text: 'Please fill all required fields.', confirmButtonColor: "#D97706" });
      return;
    }

    // Restored Payment Terms + Logic Notice
    const paymentTermsHtml = `
      <div style="text-align: left; font-size: 14px; color: #4B4B4B; line-height: 1.6;">
        <div style="background-color: #FEF3C7; padding: 12px; border-radius: 8px; border: 1px solid #E5E0D9; margin-bottom: 15px;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total Deposit:</span>
              <span style="font-weight: bold; color: #1C1C1C;">₹${totalDeposit}</span>
           </div>
           <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Monthly Rent:</span>
              <span style="font-weight: bold; color: #1C1C1C;">₹${totalRent}</span>
           </div>
           <hr style="border: 0; border-top: 1px solid #E5E0D9; margin: 8px 0;">
           <div style="display: flex; justify-content: space-between; font-weight: bold; color: #D97706; font-size: 15px;">
              <span>Amount to Pay Now:</span>
              <span>₹${amountToPayNow}</span>
           </div>
        </div>

        <p style="font-weight: bold; color: #1C1C1C; margin-bottom: 8px;">Agreement Terms:</p>
        <ul style="margin-bottom: 15px; padding-left: 20px;">
          <li><b>Notice Period:</b> 30 days notice required before vacating.</li>
          <li><b>Lock-in Period:</b> Minimum stay of 3 months applies.</li>
          <li><b>Refund:</b> Deposit is refundable after the lock-in period.</li>
        </ul>
        
        <p style="color: #1C1C1C; font-weight: 600; border: 1px dashed #D97706; padding: 10px; border-radius: 6px;">
          ⚠️ ${paymentOption === 'deposit_only' 
            ? `Notice: The monthly rent (₹${totalRent}) must be paid during check-in.` 
            : `Notice: You are choosing to pay both rent and deposit now.`}
        </p>
      </div>
    `;

    const result = await Swal.fire({
      title: "Confirm Payment Terms",
      html: paymentTermsHtml,
      showCancelButton: true,
      confirmButtonText: "Confirm & Request",
      confirmButtonColor: "#D97706", 
      cancelButtonColor: "#4B4B4B", 
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsSubmitted(true);
      const bookingPayload = {
        pgId: pg._id,
        members: personsData,
        stayDetails,
        persons,
        roomType: selectedRoom?.type || pg.occupancy || "Single Sharing"
      };

      try {
        const token = localStorage.getItem("userToken");
        const res = await fetch("http://localhost:5000/api/bookings/create", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(bookingPayload)
        });

        const body = await res.json();
        if (res.ok && body.success) {
          const created = body.booking;
          Swal.fire({ icon: 'success', title: 'Request Sent!', text: 'Owner notified. You will be able to pay once approved.', confirmButtonColor: "#D97706" })
            .then(() => navigate(`/confirmBook/${pg._id}`, { state: { bookingData: created } }));
        } else {
          throw new Error(body.message || 'Booking request failed');
        }
      } catch (err) {
        console.error('Booking API error:', err);
        setIsSubmitted(false);
        Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to send booking request. Please try again.', confirmButtonColor: "#D97706" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-h2-sm lg:text-h2 font-bold text-textPrimary mb-1">Book {pg.name}</h1>
        <p className="text-textSecondary text-body-sm lg:text-body mb-8">{pg.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {personsData.map((person, index) => (
              <div key={index} ref={(el) => (personRefs.current[index] = el)} 
                   className="bg-background rounded-md p-6 shadow-sm border border-border">
                <h3 className="font-bold text-textPrimary text-lg mb-4">Person {index + 1} (Tenant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CInput label="Full Name" required error={errors[`fullName_${index}`]} value={person.fullName} onChange={(e) => handleChange(index, "fullName", e.target.value)} />
                  <CInput label="Email" required type="email" error={errors[`email_${index}`]} value={person.email} onChange={(e) => handleChange(index, "email", e.target.value)} />
                  <CInput label="Phone Number" required error={errors[`phone_${index}`]} value={person.phone} onChange={(e) => handleChange(index, "phone", e.target.value)} />
                  <CInput type="select" label="Gender" required disabled={isGirlsHostel} error={errors[`gender_${index}`]} value={person.gender} onChange={(e) => handleChange(index, "gender", e.target.value)} options={[{ label: "Select Gender", value: "" }, { label: "Male", value: "Male" }, { label: "Female", value: "Female" }]} />
                  <CInput label="College / Workplace Name" required error={errors[`institution_${index}`]} value={person.institution} onChange={(e) => handleChange(index, "institution", e.target.value)} />
                  <CInput label="Course / Job Role" value={person.occupationRole} onChange={(e) => handleChange(index, "occupationRole", e.target.value)} />
                  <CInput label="Emergency Contact Name" value={person.emergencyName} onChange={(e) => handleChange(index, "emergencyName", e.target.value)} />
                  <CInput label="Emergency Contact Phone" required error={errors[`emergencyPhone_${index}`]} value={person.emergencyPhone} onChange={(e) => handleChange(index, "emergencyPhone", e.target.value)} />
                </div>
              </div>
            ))}

            <div className="bg-background rounded-md p-6 shadow-sm border border-border">
              <h3 className="font-bold text-textPrimary text-lg mb-4">Stay Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CInput type="date" label="Check-in Date" required error={errors.checkIn} min={today} value={stayDetails.checkIn} onChange={(e) => setStayDetails({ ...stayDetails, checkIn: e.target.value })} />
                <CInput type="date" label="Check-out Date (Optional)" error={errors.checkOut} min={stayDetails.checkIn || today} value={stayDetails.checkOut} onChange={(e) => setStayDetails({ ...stayDetails, checkOut: e.target.value })} />
              </div>
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="bg-background rounded-md p-6 shadow-md h-fit sticky top-10 border border-border">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Summary</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-primaryDark font-medium">{maxBeds} Beds Available</span>
              <div className="flex items-center gap-3 bg-primarySoft p-1 rounded-md">
                <button onClick={decrease} className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-primary font-bold shadow-sm" disabled={isSubmitted}>−</button>
                <span className="w-4 text-center font-bold text-textPrimary">{persons}</span>
                <button onClick={increase} className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-primary font-bold shadow-sm" disabled={isSubmitted}>+</button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Payment Option</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentOption("deposit_only")} className={`py-2 px-1 text-[10px] font-bold rounded-md border transition-all ${paymentOption === "deposit_only" ? "bg-primarySoft border-primary text-primary" : "bg-background border-border text-textSecondary"}`}>
                  Deposit Only
                </button>
                <button onClick={() => setPaymentOption("full_payment")} className={`py-2 px-1 text-[10px] font-bold rounded-md border transition-all ${paymentOption === "full_payment" ? "bg-primarySoft border-primary text-primary" : "bg-background border-border text-textSecondary"}`}>
                  Deposit + Rent
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-textSecondary text-sm">
                    <span>Monthly Rent</span>
                    {/* Visual Fix: Strike through if not paying now */}
                    <span className={paymentOption === "deposit_only" ? "line-through opacity-50" : ""}>₹{totalRent}</span>
                </div>
                <div className="flex justify-between text-textSecondary text-sm">
                    <span>Security Deposit</span>
                    <span>₹{totalDeposit}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-xl font-bold text-primary">
                    <span>Total Now</span>
                    <span>₹{amountToPayNow}</span>
                </div>
            </div>

            <CButton 
                className={`w-full mt-6 py-3 font-bold transition-all ${isSubmitted ? 'bg-textSecondary' : 'bg-primary hover:bg-primaryDark text-textLight'}`}
                onClick={handleBooking} 
                disabled={isSubmitted}
                text={isSubmitted ? "Request Sent" : "Request to Book"}
            />
            <p className="text-[10px] text-textSecondary text-center mt-3 uppercase tracking-wider font-semibold">
              {paymentOption === "deposit_only" ? "Rent Due at Check-in" : "Fully Pre-paid Booking"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
