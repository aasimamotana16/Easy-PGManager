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
      Swal.fire({
        icon: "warning",
        title: "City Required",
        text: "Please select a city first to explore available PGs!",
        confirmButtonColor: "#f97316",
      });
      return;
    }
    navigate(`/findMypg/pgListing?city=${encodeURIComponent(city)}`);
    fetchLivePgs(city);
  };

  return (
    <div
      className="
        bg-white
        p-6 sm:p-10
        rounded-[2rem]
        shadow-xl
        max-w-4xl
        mx-auto
        border border-primary
        relative
      "
    >
      {/* Heading - Fluid text sizes for mobile */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          Find <span className="text-primary">Paying Guest</span> Accommodation
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">
          Select your city to explore available PGs near you
        </p>
      </div>

      {/* City Selection */}
      <div className="w-full lg:max-w-xl mx-auto mb-8">
        <CSelect
          label="City"
          required
          value={city}
          onChange={(e) => {
            if (e?.target?.value !== undefined) setCity(e.target.value);
            else if (e?.value !== undefined) setCity(e.value);
            else setCity("");
          }}
          options={cityOptions}
          disabled={loading}
          placeholder={loading ? "Loading cities..." : "Select city"}
          className="w-full h-14 text-base rounded-xl border-gray-200 focus:ring-primary focus:border-primary  outline-none"
        />
      </div>

      <div className="w-full h-px bg-primary mb-8" />

      {/* Action Button */}
      <div className="flex justify-center">
        <CButton
          onClick={handleSearch}
          text="Search PGs"
          variant="contained"
          className="
            text-lg
            font-bold
            shadow-lg hover:shadow-orange-200
            transition-all
            active:scale-95
            bg-primary
          "
        />
      </div>
    </div>
  );
};

export default HomeSearch;