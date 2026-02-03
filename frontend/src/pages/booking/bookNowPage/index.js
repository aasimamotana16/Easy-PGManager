import React, { useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../../context/backendContext";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pgList, loading } = useContext(BackendContext);

  const pg = pgList?.find((item) => String(item._id) === String(id));

  const [persons, setPersons] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bedWarning, setBedWarning] = useState("");
  const [errors, setErrors] = useState({});

  const personRefs = useRef([]);

  const [personsData, setPersonsData] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      emergencyName: "",
      emergencyPhone: "",
    },
  ]);

  const [stayDetails, setStayDetails] = useState({
    checkIn: "",
    checkOut: "",
  });

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!pg) return <div className="text-center mt-20">PG not found</div>;

  /* PRICE */
  const pricePerPerson = Number(
    pg.roomPrices?.singleSharing ||
      pg.startingPrice ||
      pg.rent ||
      pg.price ||
      0
  );

  const maxBeds = pg.availableBeds || 5;
  const totalRent = pricePerPerson * persons;

  /* PERSON COUNT */
  const increase = () => {
    if (isSubmitted) return;

    if (persons >= maxBeds) {
      setBedWarning(`Only ${maxBeds} beds are available`);
      return;
    }

    setBedWarning("");
    const index = persons;

    setPersons(persons + 1);
    setPersonsData((prev) => [
      ...prev,
      {
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        emergencyName: "",
        emergencyPhone: "",
      },
    ]);

    setTimeout(() => {
      personRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const decrease = () => {
    if (isSubmitted) return;
    if (persons > 1) {
      setPersons(persons - 1);
      setPersonsData((prev) => prev.slice(0, -1));
      setBedWarning("");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...personsData];
    updated[index][field] = value;
    setPersonsData(updated);
  };

  /* VALIDATION */
  const validate = () => {
    const newErrors = {};

    personsData.forEach((p, index) => {
      if (!p.fullName.trim())
        newErrors[`fullName_${index}`] = "Full name is required";

      if (!p.email || !/^\S+@\S+\.\S+$/.test(p.email))
        newErrors[`email_${index}`] = "Valid email is required";

      if (!p.phone || !/^[6-9]\d{9}$/.test(p.phone))
        newErrors[`phone_${index}`] = "Valid phone number required";

      if (!p.gender)
        newErrors[`gender_${index}`] = "Gender is required";

      if (!p.emergencyName.trim())
        newErrors[`emergencyName_${index}`] = "Emergency contact name required";

      if (!p.emergencyPhone || !/^[6-9]\d{9}$/.test(p.emergencyPhone))
        newErrors[`emergencyPhone_${index}`] =
          "Valid emergency phone required";
    });

    if (!stayDetails.checkIn)
      newErrors.checkIn = "Check-in date is required";

    if (
      stayDetails.checkOut &&
      new Date(stayDetails.checkOut) <= new Date(stayDetails.checkIn)
    ) {
      newErrors.checkOut = "Check-out must be after check-in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const handleBooking = () => {
    if (!validate()) return;

    setIsSubmitted(true);

    const bookingData = {
      pgId: pg._id,
      persons,
      pricePerPerson,
      totalRent,
      stayDetails,
      members: personsData,
    };

    navigate(`/confirmBook/${pg._id}`, { state: { bookingData } });
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Book {pg.name}</h1>
        <p className="text-gray-600 mb-8">{pg.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {personsData.map((person, index) => (
              <div
                key={index}
                ref={(el) => (personRefs.current[index] = el)}
                className="bg-white rounded-md p-6 shadow"
              >
                <h3 className="font-semibold text-lg mb-4">
                  Person {index + 1} Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <CInput
                      label="Full Name"
                      value={person.fullName}
                      onChange={(e) =>
                        handleChange(index, "fullName", e.target.value)
                      }
                    />
                    {errors[`fullName_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`fullName_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <CInput
                      label="Email"
                      value={person.email}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                    />
                    {errors[`email_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`email_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <CInput
                      label="Phone Number"
                      value={person.phone}
                      onChange={(e) =>
                        handleChange(index, "phone", e.target.value)
                      }
                    />
                    {errors[`phone_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`phone_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      className="w-full h-10 border rounded-md px-3 mt-1"
                      value={person.gender}
                      onChange={(e) =>
                        handleChange(index, "gender", e.target.value)
                      }
                    >
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    {errors[`gender_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`gender_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <CInput
                      label="Emergency Contact Name"
                      value={person.emergencyName}
                      onChange={(e) =>
                        handleChange(index, "emergencyName", e.target.value)
                      }
                    />
                    {errors[`emergencyName_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`emergencyName_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <CInput
                      label="Emergency Contact Phone"
                      value={person.emergencyPhone}
                      onChange={(e) =>
                        handleChange(index, "emergencyPhone", e.target.value)
                      }
                    />
                    {errors[`emergencyPhone_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`emergencyPhone_${index}`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* STAY DETAILS */}
            <div className="bg-white rounded-md p-6 shadow">
              <h3 className="font-semibold text-lg mb-4">Stay Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CInput
                    type="date"
                    label="Check-in Date"
                    value={stayDetails.checkIn}
                    onChange={(e) =>
                      setStayDetails({
                        ...stayDetails,
                        checkIn: e.target.value,
                      })
                    }
                  />
                  {errors.checkIn && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkIn}
                    </p>
                  )}
                </div>

                <div>
                  <CInput
                    type="date"
                    label="Check-out Date (Optional)"
                    value={stayDetails.checkOut}
                    onChange={(e) =>
                      setStayDetails({
                        ...stayDetails,
                        checkOut: e.target.value,
                      })
                    }
                  />
                  {errors.checkOut && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkOut}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-md p-6 shadow h-fit">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

            <div className="flex justify-between items-center mb-2">
              <span className="text-green-600">
                {maxBeds} Beds Available
              </span>
              <div className="flex items-center gap-3">
                <button
                  disabled={isSubmitted}
                  onClick={decrease}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  −
                </button>
                <span>{persons}</span>
                <button
                  disabled={isSubmitted}
                  onClick={increase}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {bedWarning && (
              <p className="text-red-500 text-sm mb-3">{bedWarning}</p>
            )}

            <div className="bg-gray-100 p-4 rounded mb-6 text-center">
              <p>Per Person ₹{pricePerPerson}/month</p>
              <p className="font-semibold text-lg">
                Total ₹{totalRent}/month
              </p>
            </div>

            <CButton
              size="lg"
              className="w-full"
              onClick={handleBooking}
              disabled={isSubmitted}
            >
              Confirm Booking
            </CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
