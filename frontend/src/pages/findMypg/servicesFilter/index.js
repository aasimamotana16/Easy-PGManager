import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect"; 
import {
  genderOptions,
  occupancyOptions,
  rentCycleOptions,
  amenitiesList,
} from "../../../config/staticData";

const BUDGET_MIN = 0;
const BUDGET_MAX = 30000;
const BUDGET_STEP = 500;

export default function Filters({
  filters,
  handleFilterChange,
  toggleAmenity,
  applyFilters,
}) {
  const [isAmenityOpen, setIsAmenityOpen] = useState(false);

  useEffect(() => {
    if (filters.maxPrice === "" || filters.maxPrice === null || filters.maxPrice === undefined) {
      handleFilterChange("maxPrice", BUDGET_MAX);
    }
  }, [filters.maxPrice, handleFilterChange]);

  const rawBudget =
    filters.maxPrice === "" || Number.isNaN(Number(filters.maxPrice))
      ? BUDGET_MAX
      : Number(filters.maxPrice);

  const budget = Math.max(BUDGET_MIN, Math.min(rawBudget, BUDGET_MAX));

  const handleBudgetChange = (value) => {
    const nextBudget = Number(value);
    handleFilterChange("minPrice", "");
    handleFilterChange("maxPrice", nextBudget);
  };

  return (
    /* h-[calc(100vh-250px)] ensures the sidebar height fits the screen viewport minus headers */
    <div className="flex flex-col h-[calc(100vh-250px)]">
      
      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {/* 1. Basic Selections */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1C1C1C]">Looking For</label>
            <CSelect
              value={filters.lookingFor}
              options={genderOptions}
              onChange={(e) => handleFilterChange("lookingFor", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1C1C1C]">Occupancy</label>
            <CSelect
              value={filters.occupancy}
              options={occupancyOptions}
              onChange={(e) => handleFilterChange("occupancy", e.target.value)}
            />
          </div>
        </div>

        {/* 2. Budget Section */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#1C1C1C]">Budget</label>
          <div className="w-full rounded-md border border-[#E5E0D9] px-3 py-2">
            <p className="text-sm font-semibold text-[#4B4B4B]">Rs {budget.toLocaleString()}</p>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* 3. Rent Cycle */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#1C1C1C]">Rent Cycle</label>
          <CSelect
            value={filters.rentCycle}
            options={rentCycleOptions}
            onChange={(e) => handleFilterChange("rentCycle", e.target.value)}
          />
        </div>

        {/* 4. Amenities Dropdown */}
        <div className="border border-[#E5E0D9] rounded-md overflow-hidden">
          <button 
            type="button"
            onClick={() => setIsAmenityOpen(!isAmenityOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-50"
          >
            <span className="text-sm font-bold text-[#1C1C1C]">Select Amenities</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#D97706] text-white px-2 py-0.5 rounded-full">
                {filters.amenities.length}
              </span>
              {isAmenityOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {isAmenityOpen && (
            <div className="p-3 bg-white border-t border-[#E5E0D9]">
              <div className="grid grid-cols-1 gap-2">
                {amenitiesList.map((amenity) => {
                  const selected = filters.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-left px-3 py-2 rounded-md text-xs font-semibold border transition-all
                        ${selected 
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#D97706]" 
                          : "bg-white text-[#4B4B4B] border-[#E5E0D9]"
                        }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIXED FOOTER AREA (Always Visible) */}
      <div className="pt-4 mt-2 border-t border-[#E5E0D9] bg-white">
        <CButton
          variant="contained"
          onClick={applyFilters}
          className="w-full py-3 shadow-md font-bold"
        >
          Apply Filters
        </CButton>
              </div>
    </div>
  );
}
