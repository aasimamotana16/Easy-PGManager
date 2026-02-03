import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import { getCities } from "../../../api/api";
import { BackendContext } from "../../../context/backendContext";

const HomeSearch = () => {
  const navigate = useNavigate();
  const { fetchLivePgs } = useContext(BackendContext);

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

        const formattedCities = cities.map((item) =>
          typeof item === "string"
            ? { label: item, value: item }
            : { label: item.name, value: item.name }
        );

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
    fetchLivePgs(city);
  };

  return (
    <div
      className="
        bg-white
        p-6
        rounded-2xl
        shadow-md
        max-w-4xl
        mx-auto
        border border-border
      "
    >
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-semibold text-text-primary mb-2">
          Find Paying Guest Accommodation
        </h2>
        <p className="text-lg text-text-secondary">
          Select your city to explore available PGs near you
        </p>
      </div>

      {/* City Selection */}
      <div className="w-full max-w-md mx-auto mb-6">
        <CSelect
          label={<span className="text-base font-medium">City</span>}
          value={city}
          onChange={(e) => {
            if (e?.target?.value !== undefined) setCity(e.target.value);
            else if (e?.value !== undefined) setCity(e.value);
            else setCity("");
          }}
          options={cityOptions}
          disabled={loading}
          placeholder={loading ? "Loading cities..." : "Select city"}
          className="w-full h-12 text-base"
        />
      </div>

      <div className="w-full h-px bg-gray-200 mb-6" />

      {/* Action */}
      <div className="flex justify-center">
        <CButton
          onClick={handleSearch}
          text="Search PGs"
          variant="contained"
          className="
            w-full sm:w-auto
            px-8
            py-3
            rounded-lg
            text-sm
            font-medium
          "
        />
      </div>
    </div>
  );
};

export default HomeSearch;
