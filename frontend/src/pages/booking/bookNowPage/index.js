import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pgdetails, hosteldetails } from "../../../config/staticData";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  const [persons, setPersons] = useState(1);

  const [personsData, setPersonsData] = useState([
    { fullName: "", email: "", phone: "", checkIn: "", checkOut: "" },
  ]);

  const [errors, setErrors] = useState({});

  if (!pg) return <div className="text-center mt-20">PG not found</div>;

  const maxBeds = pg.sharing?.[0]?.available || 5;
  const pricePerPerson = pg.sharing?.[0]?.price || 0;
  const totalRent = pricePerPerson * persons;

  const increase = () => {
    if (persons < maxBeds) {
      setPersons(persons + 1);
      setPersonsData([
        ...personsData,
        { fullName: "", email: "", phone: "" },
      ]);
    }
  };

  const decrease = () => {
    if (persons > 1) {
      setPersons(persons - 1);
      setPersonsData(personsData.slice(0, -1));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...personsData];
    updated[index][field] = value;
    setPersonsData(updated);
  };

  const validate = () => {
    const newErrors = {};

    personsData.forEach((p, index) => {
      if (!p.fullName.trim())
        newErrors[`fullName_${index}`] = "Full Name required";

      if (!p.email.trim())
        newErrors[`email_${index}`] = "Email required";
      else if (!/^\S+@\S+\.\S+$/.test(p.email))
        newErrors[`email_${index}`] = "Invalid email";

      // Phone validation for ALL persons
      if (!p.phone?.trim())
        newErrors[`phone_${index}`] = "Phone number required";
      else if (!/^[6-9]\d{9}$/.test(p.phone))
        newErrors[`phone_${index}`] = "Invalid phone number";

      // Booking details ONLY for first person
      if (index === 0) {
        if (!p.checkIn)
          newErrors.checkIn = "Check-in date required";

        // Checkout is OPTIONAL
        if (p.checkOut && p.checkIn) {
          if (new Date(p.checkOut) <= new Date(p.checkIn)) {
            newErrors.checkOut =
              "Check-out must be after check-in";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!validate()) return;

    const bookingData = {
      pgId: pg.id,
      persons,
      pricePerPerson,
      totalRent,
      members: personsData,
    };

    navigate(`/confirm/${pg.id}`, { state: { bookingData } });
  };

  return (
    <div className="min-h-screen bg-dashboard-gradient px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Book {pg.name}</h1>
        <p className="text-gray-600 mb-8">{pg.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="lg:col-span-2 space-y-6">
            {personsData.map((person, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-semibold text-lg mb-4">
                  Person {index + 1} Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <CInput
                      placeholder="Full Name"
                      value={person.fullName}
                      onChange={(e) =>
                        handleChange(index, "fullName", e.target.value)
                      }
                    />
                    {errors[`fullName_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`fullName_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <CInput
                      placeholder="Email"
                      value={person.email}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                    />
                    {errors[`email_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`email_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <CInput
                      placeholder="Phone Number"
                      value={person.phone}
                      onChange={(e) =>
                        handleChange(index, "phone", e.target.value)
                      }
                    />
                    {errors[`phone_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`phone_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* First person booking dates */}
                  {index === 0 && (
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Check-in Date
                        </label>
                        <CInput
                          type="date"
                          value={person.checkIn}
                          onChange={(e) =>
                            handleChange(index, "checkIn", e.target.value)
                          }
                        />
                        {errors.checkIn && (
                          <p className="text-red-500 text-sm">
                            {errors.checkIn}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Expected Check-out Date (Optional)
                        </label>
                        <CInput
                          type="date"
                          value={person.checkOut}
                          onChange={(e) =>
                            handleChange(index, "checkOut", e.target.value)
                          }
                        />
                        {errors.checkOut && (
                          <p className="text-red-500 text-sm">
                            {errors.checkOut}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="bg-white rounded-xl p-6 shadow h-fit lg:w-full">
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

            <div className="flex justify-between items-center mb-4">
              <span className="text-green-600">
                {maxBeds} Beds Available
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrease}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  −
                </button>
                <span>{persons}</span>
                <button
                  onClick={increase}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded mb-6 text-center">
              <p>Per Person ₹{pricePerPerson}/month</p>
              <p className="font-semibold text-lg">
                Total ₹{totalRent}/month
              </p>
            </div>

            <CButton
              size="lg"
              className="w-full bg-orange-500 text-white"
              onClick={handleBooking}
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
