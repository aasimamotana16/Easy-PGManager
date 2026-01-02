import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import CButton from "../../../components/cButton"; 
import CSelect from "../../../components/cSelect"; 
import { getCities } from "../../../services/api"; 

const HomeSearch = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await getCities(); 
        const formattedCities = response.data.map((cityName) => ({
          label: cityName,
          value: cityName,
        }));
        setCityOptions(formattedCities);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };
    fetchCityData();
  }, []);

  // UPDATED: Added 'e' and 'e.preventDefault()' to stop page reload
  const handleSearch = (e, type) => {
    if (e) e.preventDefault(); 
    
    if (!city) {
      alert("Please select a city first!");
      return;
    }
    navigate(`/search-results?city=${city}&type=${type}`);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto -mt-24 relative z-10 border border-border">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Find PGs & Hostels Near You
        </h2>
        <p className="text-text-secondary">
          Choose your city and accommodation type to get started.
        </p>
      </div>

          {/* CITY SELECT */}
          <div className="max-w-md mx-auto mb-6">
            <CSelect
              label="Select City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={[
                { value: "ahmedabad", label: "Ahmedabad" },
                { value: "surat", label: "Surat" },
                { value: "vadodara", label: "Vadodara" },
                { value: "rajkot", label: "Rajkot" },
                { value: "bhavnagar", label: "Bhavnagar" },
                { value: "jamnagar", label: "Jamnagar" },
                { value: "gandhinagar", label: "Gandhinagar" },
                { value: "nadiad", label: "Nadiad" },
                { value: "anand", label: "Anand" },
                { value: "bharuch", label: "Bharuch" },
                { value: "valsad", label: "Valsad" },
                { value: "vapi", label: "Vapi" },
                { value: "navsari", label: "Navsari" },
              ]}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <CButton
              onClick={() => handleSearch("pg")}
              text="Paying Guest"
              variant="contained"
              className="flex-1 py-3 rounded-xl text-base font-semibold"
            />

            <CButton
              onClick={() => handleSearch("hostel")}
              text="Hostel Stay"
              variant="contained"
              className="flex-1 py-3 rounded-xl text-base font-semibold"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeSearch;