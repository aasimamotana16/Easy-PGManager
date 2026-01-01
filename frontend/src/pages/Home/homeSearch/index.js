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

      <div className="max-w-md mx-auto">
        <CSelect
          label="Select City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          options={cityOptions}
        />

        <div className="flex gap-4 mt-4">
          {/* UPDATED: Passing 'e' into handleSearch */}
          <CButton 
            className="flex-1" 
            onClick={(e) => handleSearch(e, "Paying Guest")}
          >
            Paying Guest
          </CButton>
          <CButton 
            className="flex-1" 
            variant="outline" 
            onClick={(e) => handleSearch(e, "Hostel Stay")}
          >
            Hostel Stay
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default HomeSearch;