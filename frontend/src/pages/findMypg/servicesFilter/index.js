import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import { genderOptions, occupancyOptions, rentCycleOptions, amenitiesList } from "../../../config/staticData";

export default function Filters({ filters, handleFilterChange, toggleAmenity }) {
  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl space-y-12 mb-24">

      {/* Basic Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <CInput
          type="select"
          label="Looking For"
          value={filters.lookingFor}
          onChange={(e) => handleFilterChange("lookingFor", e.target.value)}
          options={genderOptions}
        />
        <CInput
          type="select"
          label="Occupancy"
          value={filters.occupancy}
          onChange={(e) => handleFilterChange("occupancy", e.target.value)}
          options={occupancyOptions}
        />
      </div>

      {/* Price + Rent Cycle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div>
          <label className="block text-lg font-semibold mb-3">Price Range (₹)</label>
          <div className="flex gap-5">
            <CInput
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <CInput
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <CInput
          type="select"
          label="Rent Cycle"
          value={filters.rentCycle}
          onChange={(e) => handleFilterChange("rentCycle", e.target.value)}
          options={rentCycleOptions}
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-lg font-semibold mb-5">Amenities</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {amenitiesList.map((amenity) => {
            const selected = filters.amenities.includes(amenity);
            return (
              <CButton
                key={amenity}
                size="sm"
                variant={selected ? "contained" : "outlined"}
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
              </CButton>
            );
          })}
        </div>
      </div>

      {/* Sort + Reset */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t">
        <CInput
          type="select"
          label="Sort By"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          options={[
            { label: "Default", value: "" },
            { label: "Price: Low → High", value: "priceAsc" },
            { label: "Price: High → Low", value: "priceDesc" },
          ]}
        />
        <CButton
          variant="contained"
          size="md"
          className="bg-red-600 hover:bg-red-700"
          onClick={() =>
            handleFilterChange("", {
              lookingFor: "Any",
              occupancy: "Any",
              minPrice: "",
              maxPrice: "",
              rentCycle: "Any",
              amenities: [],
              sortBy: "",
            })
          }
        >
          Reset Filters
        </CButton>
      </div>
    </div>
  );
}
