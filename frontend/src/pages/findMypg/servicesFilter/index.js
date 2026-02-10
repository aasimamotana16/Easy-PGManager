import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import CSelect from "../../../components/cSelect"; 
import {
  genderOptions,
  occupancyOptions,
  rentCycleOptions,
  amenitiesList,
} from "../../../config/staticData";

export default function Filters({
  filters,
  handleFilterChange,
  toggleAmenity,
  applyFilters,
}) {
  const [isAmenityOpen, setIsAmenityOpen] = useState(false);

  const handleNumberScroll = (e) => {
    e.preventDefault(); 
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
        <div className="grid grid-cols-2 gap-4">
          <CInput
            type="number"
            label="Min Budget"
            placeholder="0"
            value={filters.minPrice}
            onWheel={handleNumberScroll} 
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
          <CInput
            type="number"
            label="Max Budget"
            placeholder="No Max"
            value={filters.maxPrice}
            onWheel={handleNumberScroll}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
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
        <div className="border border-[#E5E0D9] rounded-xl overflow-hidden">
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
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all
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