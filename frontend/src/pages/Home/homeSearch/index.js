import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import { getCities } from "../../../api/api";
import { BackendContext } from "../../../context/backendContext";
import Swal from "sweetalert2";

const HomeSearch = () => {
  const navigate = useNavigate();
  const { fetchLivePgs } = useContext(BackendContext);

  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK_CITIES = [
    { label: "Ahmedabad", value: "Ahmedabad" },
    { label: "Surat", value: "Surat" },
    { label: "Vadodara", value: "Vadodara" },
    { label: "Rajkot", value: "Rajkot" },
  ];

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await getCities();
        let cities = [];
        
        if (Array.isArray(response?.data)) cities = response.data;
        else if (Array.isArray(response?.data?.cities)) cities = response.data.cities;

        const formattedCities = cities.map((item) =>
          typeof item === "string"
            ? { label: item, value: item }
            : { label: item.name, value: item.name }
        );
        
        setCityOptions(formattedCities.length > 0 ? formattedCities : FALLBACK_CITIES);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCityOptions(FALLBACK_CITIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCityData();
  }, []);

  const handleSearch = () => {
    if (!city) {
      Swal.fire({
        icon: "warning",
        title: "City Required",
        text: "Please select a city first to explore available PGs!",
        confirmButtonColor: "#D97706", 
      });
      return;
    }
    
    navigate(`/findMypg/pgListing?city=${encodeURIComponent(city)}`);
    fetchLivePgs(city);
  };

  return (
    /* Using background and primary border from theme */
    <div className="bg-background p-6 sm:p-10 rounded-2xl max-w-4xl mx-auto border border-primary relative shadow-md">
      
      {/* Heading - Now fully responsive with text-h2-sm and lg:text-h2 */}
      <div className="text-center mb-8">
        <h2 className="text-h2-sm lg:text-h2 text-textPrimary mb-2 leading-tight">
          Find <span className="text-primary">Paying Guest</span> Accommodation
        </h2>
        <p className="text-body-sm lg:text-body text-textSecondary font-medium">
          Select your city to explore available PGs near you
        </p>
      </div>

      {/* City Selection */}
      <div className="w-full lg:max-w-xl mx-auto mb-8">
        <CSelect
          label="Select Your City"
          name="citySearch"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          options={cityOptions}
          disabled={loading}
          className="w-full"
        />
      </div>

      {/* Modern Separator using border color */}
      <div className="w-full h-px bg-border mb-8 opacity-50" />

      {/* Action Button */}
      <div className="flex justify-center">
        <CButton
          onClick={handleSearch}
          text={loading ? "Loading..." : "Search PGs"}
          disabled={loading}
          className="px-12 py-4 text-lg font-bold"
        />
      </div>
    </div>
  );
};

export default HomeSearch;