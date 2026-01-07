import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import { getCities } from "../../../api/api";

const HomeSearch = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await getCities();
        let cities = [];

        if (Array.isArray(response?.data)) cities = response.data;
        else if (Array.isArray(response?.data?.cities)) cities = response.data.cities;

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

  const handleSearch = (type) => {
    if (!city) {
      alert("Please select a city first!");
      return;
    }
    navigate(`/findMypg/${type}?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto -mt-30 relative z-10 border border-border">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Find PGs & Hostels Near You
        </h2>
        <p className="text-text-secondary">
          Choose your city and accommodation type to get started.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <CSelect
          label="Select City"
          value={city}
          // ✅ Support both native and custom select
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

      <div className="flex flex-col sm:flex-row gap-4">
        <CButton
          onClick={() => handleSearch("pgListing")}
          text="Paying Guest"
          variant="contained"
          className="flex-1 py-3 rounded-xl text-base font-semibold"
        />
        <CButton
          onClick={() => handleSearch("hostelListing")}
          text="Hostel Stay"
          variant="contained"
          className="flex-1 py-3 rounded-xl text-base font-semibold"
        />
      </div>
    </div>
  );
};

export default HomeSearch;
