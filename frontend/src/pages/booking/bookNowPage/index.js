import React, { useState, useContext, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../../context/backendContext";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import Loader from "../../../components/loader";
import Swal from "sweetalert2";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pgList, loading: backendLoading } = useContext(BackendContext);

  const pg = pgList?.find((item) => String(item._id) === String(id));
  const isGirlsHostel = pg?.name?.toLowerCase().includes("girls");

  const today = new Date().toISOString().split("T")[0];

  const [persons, setPersons] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

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

  const pricePerPerson = Number(pg.roomPrices?.singleSharing || pg.startingPrice || pg.rent || pg.price || 0);
  const maxBeds = pg.availableBeds || 5;
  const totalRent = pricePerPerson * persons;

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
      if (!p.email) {
          newErrors[`email_${index}`] = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(p.email)) {
          newErrors[`email_${index}`] = "Invalid email format";
      }
      if (!p.phone) {
          newErrors[`phone_${index}`] = "Phone number is required";
      } else if (p.phone.length !== 10) {
          newErrors[`phone_${index}`] = "Must be 10 digits";
      }
      if (!p.gender) newErrors[`gender_${index}`] = "Please select gender";
      if (!p.institution.trim()) newErrors[`institution_${index}`] = "Institution name is required";
      if (!p.emergencyPhone) {
          newErrors[`emergencyPhone_${index}`] = "Emergency contact is required";
      } else if (p.emergencyPhone.length !== 10) {
          newErrors[`emergencyPhone_${index}`] = "Must be 10 digits";
      }
    });

    if (!stayDetails.checkIn) {
        newErrors.checkIn = "Check-in date is required";
    } else if (stayDetails.checkIn < today) {
        newErrors.checkIn = "Date cannot be in the past";
    }

    if (stayDetails.checkOut && new Date(stayDetails.checkOut) <= new Date(stayDetails.checkIn)) {
        newErrors.checkOut = "Must be after check-in date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!validate()) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Form Incomplete', 
        text: 'Please check the required fields highlighted in red.', 
        confirmButtonColor: "#D97706" // Using theme primary [cite: 2026-02-09]
      });
      return;
    }

    const result = await Swal.fire({
      title: "Send Request?",
      text: "The owner will review your details. You'll be notified to pay after approval.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Request",
      confirmButtonColor: "#D97706", // Using theme primary [cite: 2026-02-09]
      cancelButtonColor: "#4B4B4B", // Using theme textSecondary [cite: 2026-02-09]
    });

    if (result.isConfirmed) {
      setIsSubmitted(true);
      const bookingData = {
        pgId: pg._id,
        persons,
        pricePerPerson,
        totalRent,
        stayDetails,
        members: personsData,
        status: "PENDING_APPROVAL"
      };

      Swal.fire({
        icon: 'success',
        title: 'Request Sent!',
        text: 'Owner notified. Check your dashboard for status updates.',
        confirmButtonColor: "#D97706"
      }).then(() => {
        navigate(`/confirmBook/${pg._id}`, { state: { bookingData } });
      });
    }
  };

  return (
    /* Background set to backgroundDefault [cite: 2026-02-09] */
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-h2-sm lg:text-h2 font-bold text-textPrimary mb-1">Book {pg.name}</h1>
        <p className="text-textSecondary text-body-sm lg:text-body mb-8">{pg.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {personsData.map((person, index) => (
              <div key={index} ref={(el) => (personRefs.current[index] = el)} 
                   className="bg-background rounded-xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-textPrimary text-lg mb-4">Person {index + 1} (Tenant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CInput 
                    label="Full Name" 
                    required 
                    error={errors[`fullName_${index}`]}
                    value={person.fullName} 
                    onChange={(e) => handleChange(index, "fullName", e.target.value)} 
                  />
                  <CInput 
                    label="Email" 
                    required
                    type="email"
                    error={errors[`email_${index}`]}
                    value={person.email} 
                    onChange={(e) => handleChange(index, "email", e.target.value)} 
                  />
                  <CInput 
                    label="Phone Number" 
                    required
                    error={errors[`phone_${index}`]}
                    value={person.phone} 
                    onChange={(e) => handleChange(index, "phone", e.target.value)} 
                  />
                  
                  <CInput
                    type="select"
                    label="Gender"
                    required
                    disabled={isGirlsHostel}
                    error={errors[`gender_${index}`]}
                    value={person.gender}
                    onChange={(e) => handleChange(index, "gender", e.target.value)}
                    options={[
                        { label: "Select Gender", value: "" },
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                    ]}
                  />

                  <CInput 
                    label="College / Workplace Name" 
                    required
                    error={errors[`institution_${index}`]}
                    placeholder="e.g. IIT Bombay / Google" 
                    value={person.institution} 
                    onChange={(e) => handleChange(index, "institution", e.target.value)} 
                  />
                  <CInput 
                    label="Course / Job Role" 
                    placeholder="e.g. B.Tech 3rd Year / Analyst" 
                    value={person.occupationRole} 
                    onChange={(e) => handleChange(index, "occupationRole", e.target.value)} 
                  />

                  <CInput 
                    label="Emergency Contact Name" 
                    value={person.emergencyName} 
                    onChange={(e) => handleChange(index, "emergencyName", e.target.value)} 
                  />
                  <CInput 
                    label="Emergency Contact Phone" 
                    required
                    error={errors[`emergencyPhone_${index}`]}
                    value={person.emergencyPhone} 
                    onChange={(e) => handleChange(index, "emergencyPhone", e.target.value)} 
                  />
                </div>
              </div>
            ))}

            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-textPrimary text-lg mb-4">Stay Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CInput
                  type="date"
                  label="Check-in Date"
                  required
                  error={errors.checkIn}
                  min={today}
                  value={stayDetails.checkIn}
                  onChange={(e) => {
                      setStayDetails({ ...stayDetails, checkIn: e.target.value });
                      if(errors.checkIn) setErrors({...errors, checkIn: false});
                  }}
                />
                <CInput
                  type="date"
                  label="Check-out Date (Optional)"
                  error={errors.checkOut}
                  min={stayDetails.checkIn || today}
                  value={stayDetails.checkOut}
                  onChange={(e) => {
                      setStayDetails({ ...stayDetails, checkOut: e.target.value });
                      if(errors.checkOut) setErrors({...errors, checkOut: false});
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sticky Summary Card [cite: 2026-02-06] */}
          <div className="bg-background rounded-xl p-6 shadow-md h-fit sticky top-10 border border-border">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Summary</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-primaryDark font-medium">{maxBeds} Beds Available</span>
              <div className="flex items-center gap-3 bg-primarySoft p-1 rounded-lg">
                <button onClick={decrease} 
                        className="w-8 h-8 flex items-center justify-center bg-background rounded-md shadow-sm disabled:opacity-50 text-primary font-bold" 
                        disabled={isSubmitted}>−</button>
                <span className="w-4 text-center font-bold text-textPrimary">{persons}</span>
                <button onClick={increase} 
                        className="w-8 h-8 flex items-center justify-center bg-background rounded-md shadow-sm disabled:opacity-50 text-primary font-bold" 
                        disabled={isSubmitted}>+</button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-textSecondary text-body-sm">
                    <span>Rent ({persons} Person)</span>
                    <span>₹{totalRent}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>₹{totalRent}</span>
                </div>
            </div>

            <CButton 
                className={`w-full mt-6 py-3 font-bold transition-all ${isSubmitted ? 'bg-textSecondary' : 'bg-primary hover:bg-primaryDark text-textLight'}`}
                onClick={handleBooking} 
                disabled={isSubmitted}
                text={isSubmitted ? "Request Sent" : "Request to Book"}
            />
            <p className="text-[10px] text-textSecondary text-center mt-3 uppercase tracking-wider font-semibold">
              Approval Required • No Payment Now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;