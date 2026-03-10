import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, SearchX, SlidersHorizontal } from "lucide-react";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import CButton from "../../components/cButton";

import Filters from "./servicesFilter";
import PGListings from "./pgListing";
import { API_BASE } from "../../config/apiBaseUrl";

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

  useEffect(() => {
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const currentCity = urlParams.get("city") || "";
    const queryParams = currentCity ? `?city=${encodeURIComponent(currentCity)}` : "";
    fetch(`${API_BASE}/pg/all${queryParams}`)
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

      const response = await fetch(`${API_BASE}/pg/search?${queryParams}`);
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
    <div className="bg-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* RESTORED PREVIOUS HEADING STYLE */}
       <div className={`relative mt-8 md:mt-12 mb-10 ${showBackButton ? 'pl-16' : ''}`}> 
  {/* Added dynamic left padding (pl-16) to make room for the button */}
  
  {showBackButton && (
    <button
      onClick={() => navigate(-1)}
      className="absolute left-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-border hover:bg-primarySoft transition-all"
      aria-label="Go back"
    >
      <ArrowLeft size={22} className="text-textPrimary" />
    </button>
  )}

  <h1 className="text-h1-sm lg:text-h1 font-bold text-textPrimary tracking-tight">
    Find your <span className="text-primary">Perfect</span> stay
  </h1>
  
  <p className="text-textSecondary mt-2 text-sm sm:text-base font-medium">
    Apply filters to discover verified properties that match your lifestyle and budget.
  </p>
</div>

        {/* --- UPDATED 40/60 GRID CONTAINER --- */}
        <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-10">
          
          {/* LEFT SIDE: FILTER SECTION (40%) */}
          <aside className="w-full lg:w-[30%] lg:sticky lg:top-24 mb-8 lg:mb-0">
            <div className="bg-white border border-primary rounded-md p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E5E0D9]">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={24} className="text-[#D97706]" />
                  <h3 className="font-bold text-[#1C1C1C] mb-0 leading-none">Search Filters</h3>
                </div>
                <button 
                   onClick={() => handleFilterChange("reset")}
                   className="text-sm font-bold text-[#D97706] hover:underline mb-0 leading-none whitespace-nowrap"
                >
                  Reset All
                </button>
              </div>

              <Filters
                filters={tempFilters}
                handleFilterChange={handleFilterChange}
                toggleAmenity={toggleAmenity}
                applyFilters={applyFiltersClick}
              />
            </div>
          </aside>

          {/* RIGHT SIDE: PG LISTINGS (60%) */}
          <div className="w-full lg:w-[70%]">
            {filteredPGs.length > 0 ? (
              <div className="flex flex-col gap-6 w-full">
                <PGListings list={filteredPGs} />
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FEF3C7]/20 rounded-md border border-dashed border-[#E5E0D9] px-6">
                <SearchX size={60} className="mx-auto text-[#4B4B4B]/30 mb-4" />
                <h3 className="text-xl font-bold text-[#1C1C1C]">No Matching stays found</h3>
                <p className="text-[#4B4B4B] mt-2 mb-6">Try changing your location or filters.</p>
                <CButton 
                  text="Clear Filters" 
                  onClick={() => handleFilterChange("reset")} 
                />
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}