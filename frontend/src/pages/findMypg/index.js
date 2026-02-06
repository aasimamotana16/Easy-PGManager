import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { ArrowLeft } from "lucide-react"; 

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; 

import Filters from "./servicesFilter";
import PGListings from "./pgListing";

const DEFAULT_FILTERS = {
  lookingFor: "Any",
  occupancy: "Any",
  minPrice: "",
  maxPrice: "",
  rentCycle: "Any",
  amenities: [],
  sortBy: "",
};

export default function FindMyPG() {
  const locationObj = useLocation();
  const navigate = useNavigate(); 
  
  // Only show back button if 'fromServices' exists in navigation state
  const showBackButton = locationObj.state?.fromServices;

  const city = new URLSearchParams(locationObj.search).get("city");

  const [pgList, setPgList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= FETCH PGs (Initial) ================= */
  useEffect(() => {
    setIsLoading(true); 
    fetch("http://localhost:5000/api/pg/all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPgList(json.data);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => {
        setTimeout(() => setIsLoading(false), 600);
      });
  }, []);

  /* ================= FILTER STATES ================= */
  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* ================= FILTER HANDLERS ================= */
  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      resetFilters();
      return;
    }
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setTempFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const resetFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  /* ================= APPLY FILTERS ================= */
  const applyFiltersClick = async () => {
    setIsLoading(true); 
    try {
      const queryParams = new URLSearchParams({
        city: city || "Any",
        lookingFor: tempFilters.lookingFor,
        occupancy: tempFilters.occupancy,
        minPrice: tempFilters.minPrice,
        maxPrice: tempFilters.maxPrice,
        rentCycle: tempFilters.rentCycle,
        amenities: tempFilters.amenities.join(","),
      }).toString();

      const response = await fetch(`http://localhost:5000/api/pg/search?${queryParams}`);
      const json = await response.json();

      if (json.success) {
        setPgList(json.data);
        setFilters(tempFilters);
      }
    } catch (err) {
      console.error("Filter request failed:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 600); 
    }
  };

  /* ================= SORT + FILTER LOGIC ================= */
  const filteredPGs = useMemo(() => {
    let list = [...pgList];
    if (filters.sortBy === "priceAsc") {
      list = [...list].sort((a, b) => Number(a.rent) - Number(b.rent));
    }
    if (filters.sortBy === "priceDesc") {
      list = [...list].sort((a, b) => Number(b.rent) - Number(a.rent));
    }
    return list;
  }, [filters.sortBy, pgList]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        
        {/* --- BACK BUTTON (Conditional) --- */}
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-gray-500 hover:text-primary transition-all mb-6 text-sm font-medium animate-fadeIn"
          >
            <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-primary/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Services
          </button>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          {city ? `PGs in ${city}` : "Find Your Perfect Stay"}
        </h1>

        <Filters
          filters={tempFilters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
          applyFilters={applyFiltersClick}
        />

        <div className="mt-10">
            <PGListings list={filteredPGs} />

            {filteredPGs.length === 0 && (
              <div className="text-center py-20">
                  <p className="text-xl text-gray-500">
                      No PGs found matching your requirements.
                  </p>
                  <button 
                      onClick={resetFilters}
                      className="mt-4 text-orange-600 font-semibold hover:underline"
                  >
                      Clear all filters
                  </button>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}