import React from "react";
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
  
  // Strict Laptop/Mouse scroll fix:
  // This prevents the value from changing but keeps the cursor inside the box.
  const handleNumberScroll = (e) => {
    e.preventDefault(); 
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl space-y-8 sm:space-y-12 mb-12 sm:mb-24 border border-primary">

      {/* Looking For & Occupancy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Looking For</label>
          <CSelect
            value={filters.lookingFor}
            options={genderOptions}
            onChange={(e) => handleFilterChange("lookingFor", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Occupancy</label>
          <CSelect
            value={filters.occupancy}
            options={occupancyOptions}
            onChange={(e) => handleFilterChange("occupancy", e.target.value)}
          />
        </div>
      </div>

      {/* Budget Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
        <CInput
          type="number"
          label="Min Budget (₹)"
          placeholder="0"
          value={filters.minPrice}
          // We use onWheel with preventDefault to stop scroll-to-change
          onWheel={handleNumberScroll} 
          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
        />

        <CInput
          type="number"
          label="Max Budget (₹)"
          placeholder="No Max"
          value={filters.maxPrice}
          onWheel={handleNumberScroll}
          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
        />
      </div>

      {/* Rent Cycle */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Rent Cycle</label>
        <CSelect
          value={filters.rentCycle}
          options={rentCycleOptions}
          onChange={(e) => handleFilterChange("rentCycle", e.target.value)}
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-base sm:text-lg font-semibold mb-5">
          Amenities
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {amenitiesList.map((amenity) => {
            const selected = filters.amenities.includes(amenity);
            return (
              <CButton
                key={amenity}
                variant={selected ? "contained" : "outlined"}
                onClick={() => toggleAmenity(amenity)}
                className="text-xs sm:text-sm py-2"
              >
                {amenity}
              </CButton>
            );
          })}
        </div>
      </div>

      {/* Submit & Reset */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-50">
        <CButton
          variant="contained"
          onClick={applyFilters}
          className="w-full sm:w-auto sm:min-w-[200px] py-3 font-bold"
        >
          Apply Filters
        </CButton>

        <CButton
          variant="outlined"
          onClick={() => handleFilterChange("reset")}
          className="w-full sm:w-auto sm:min-w-[200px] py-3 font-bold"
        >
          Reset Filters
        </CButton>
      </div>
    </div>
  );
}