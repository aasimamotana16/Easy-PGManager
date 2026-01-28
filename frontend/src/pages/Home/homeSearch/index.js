import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import { getCities } from "../../../api/api";
import { BackendContext } from "../../../context/backendContext"; // 2. Import your Context

const HomeSearch = () => {
  const navigate = useNavigate();
  const { fetchLivePgs } = useContext(BackendContext); // 3. Grab the fetch function
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await getCities();
        let cities = [];

        if (Array.isArray(response?.data)) cities = response.data;
        else if (Array.isArray(response?.data?.cities))
          cities = response.data.cities;

        const formattedCities = cities.map((item) => {
          if (typeof item === "string") return { label: item, value: item };
          return { label: item.name, value: item.name };
        });

        setCityOptions(formattedCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCityOptions([
          { label: "Ahmedabad", value: "Ahmedabad" },
          { label: "Surat", value: "Surat" },
          { label: "Vadodara", value: "Vadodara" },
          { label: "Rajkot", value: "Rajkot" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, []);

  const handleSearch = () => {
    if (!city) {
      alert("Please select a city first!");
      return;
    }
    navigate(`/findMypg/pgListing?city=${encodeURIComponent(city)}`);
    // 5. THIS IS THE FIX: Call the context function immediately!
    // This updates the global state without needing a refresh.
    fetchLivePgs(city);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-4xl mx-auto relative z-10 border border-border">
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">
          Find Paying Guest Accommodation
        </h2>
        <p className="text-text-secondary text-sm md:text-base">
          Select your city to explore available PGs near you
        </p>
      </div>

      {/* City Selection */}
      <div className="max-w-md mx-auto mb-6">
        <CSelect
          label="City"
          value={city}
          onChange={(e) => {
            if (e?.target?.value !== undefined) setCity(e.target.value);
            else if (e?.value !== undefined) setCity(e.value);
            else setCity("");
          }}
          options={cityOptions}
          disabled={loading}
          placeholder={loading ? "Loading cities..." : "Select city"}
        />
      </div>

      <div className="w-full h-px bg-gray-200 mb-6" />

      {/* Action */}
      <div className="flex justify-center">
        <CButton
          onClick={handleSearch}
          text="Search PGs"
          variant="contained"
          className="px-10 py-3 rounded-lg text-base font-medium"
        />
      </div>
    </div>
  );
};

export default HomeSearch;
