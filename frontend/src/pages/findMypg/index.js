import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { ArrowLeft, SearchX } from "lucide-react"; 

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
  
  const showBackButton = locationObj.state?.fromServices;
  const city = new URLSearchParams(locationObj.search).get("city");

  const [pgList, setPgList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- LAPTOP SCROLL FIX (Global Handler) ---
  useEffect(() => {
    const handleWheel = (e) => {
      // If the focused element is a number input, prevent scroll-to-change
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  /* ================= FETCH DATA ================= */
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

  const [tempFilters, setTempFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* ================= HANDLERS ================= */
  const handleFilterChange = (key, value) => {
    if (key === "reset") {
      setTempFilters(DEFAULT_FILTERS);
      setFilters(DEFAULT_FILTERS);
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

  const filteredPGs = useMemo(() => {
    let list = [...pgList];
    if (filters.sortBy === "priceAsc") {
      list.sort((a, b) => Number(a.rent) - Number(b.rent));
    }
    if (filters.sortBy === "priceDesc") {
      list.sort((a, b) => Number(b.rent) - Number(a.rent));
    }
    return list;
  }, [filters.sortBy, pgList]);

  if (isLoading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      {/* Main Container - Fully Responsive Padding */}
<main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full">
  
  {/* Back Button - Minimalist Arrow Version */}
  <div className="flex justify-start mb-6">
    {showBackButton && (
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center justify-center outline-none"
        aria-label="Go back" // Proper accessibility since text is removed
      >
        <div className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 
                        group-hover:bg-primary group-hover:text-white group-hover:border-primary 
                        transition-all duration-300 hover:shadow-md active:scale-95">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </div>
      </button>
    )}
  </div>

        {/* Responsive Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 tracking-tight px-2">
            {city ? `PGs in ${city}` : "Find Your Perfect Stay"}
          </h1>
          <p className="text-gray-500 mt-3 text-sm md:text-lg max-w-2xl mx-auto">
            Browse verified listings with the best amenities in town.
          </p>
        </div>

        {/* Filters Section */}
        <Filters
          filters={tempFilters}
          handleFilterChange={handleFilterChange}
          toggleAmenity={toggleAmenity}
          applyFilters={applyFiltersClick}
        />

        {/* Listings Result Section */}
        <div className="mt-10 md:mt-16">
            <PGListings list={filteredPGs} />

            {/* Empty State UI */}
            {filteredPGs.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm px-6">
                  <div className="flex justify-center mb-4 text-gray-300">
                    <SearchX size={60} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">No results found</h3>
                  <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm md:text-base">
                    We couldn't find any PGs matching your current filters. Try adjusting your budget or amenities.
                  </p>
                  <button 
                    onClick={() => handleFilterChange("reset")}
                    className="mt-6 px-8 py-2.5 bg-primary text-white rounded-full font-bold shadow-md hover:opacity-90 transition-all"
                  >
                    Reset All Filters
                  </button>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}