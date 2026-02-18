import { useState } from "react";
import {
  genderOptions,
  occupancyOptions,
  rentCycleOptions,
  gracePeriodOptions,
  amenitiesList,
  extrasList,
} from "../../config/staticData";
import CButton from "../../components/cButton";
import CInput from "../../components/cInput";

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    gender: "",
    occupancy: "",
    price: [1000, 50000],
    rentCycle: "",
    gracePeriod: "",
    amenities: [],
    extras: [],
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleOption = (item, key) => {
    const current = filters[key];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    handleChange(key, updated);
  };

  return (
    <div className="p-6 bg-card rounded-md shadow-card space-y-6">

      {/* Gender */}
      <CInput
        type="select"
        label="Looking for?"
        value={filters.gender}
        onChange={(e) => handleChange("gender", e.target.value)}
        options={genderOptions.map((o) => ({
          label: o,
          value: o.toLowerCase(),
        }))}
      />

      {/* Occupancy */}
      <CInput
        type="select"
        label="Occupancy"
        value={filters.occupancy}
        onChange={(e) => handleChange("occupancy", e.target.value)}
        options={occupancyOptions.map((o) => ({
          label: o,
          value: o.toLowerCase(),
        }))}
      />

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium mb-2 text-text-secondary">
          Price Range (₹)
        </label>
        <div className="flex gap-2 items-center">
          <CInput
            type="number"
            value={filters.price[0]}
            min={1000}
            max={50000}
            onChange={(e) =>
              handleChange("price", [Number(e.target.value), filters.price[1]])
            }
          />
          <span className="text-text-secondary">to</span>
          <CInput
            type="number"
            value={filters.price[1]}
            min={1000}
            max={50000}
            onChange={(e) =>
              handleChange("price", [filters.price[0], Number(e.target.value)])
            }
          />
        </div>
      </div>

      {/* Rent Cycle */}
      <CInput
        type="select"
        label="Rent Cycle"
        value={filters.rentCycle}
        onChange={(e) => handleChange("rentCycle", e.target.value)}
        options={rentCycleOptions.map((o) => ({
          label: o,
          value: o.toLowerCase(),
        }))}
      />

      {/* Grace Period */}
      <CInput
        type="select"
        label="Grace Period"
        value={filters.gracePeriod}
        onChange={(e) => handleChange("gracePeriod", e.target.value)}
        options={gracePeriodOptions.map((o) => ({
          label: o,
          value: o.toLowerCase(),
        }))}
      />

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium mb-2 text-text-secondary">
          Amenities
        </label>
        <div className="grid grid-cols-1 gap-2">
          {amenitiesList.map((item) => (
            <CButton
              key={item}
              size="md"
              fullWidth
              variant={
                filters.amenities.includes(item) ? "contained" : "outlined"
              }
              onClick={() => toggleOption(item, "amenities")}
            >
              {item}
            </CButton>
          ))}
        </div>
      </div>

      {/* Additional Facilities */}
      <div>
        <label className="block text-sm font-medium mb-2 text-text-secondary">
          Additional Facilities
        </label>
        <div className="grid grid-cols-1 gap-2">
          {extrasList.map((item) => (
            <CButton
              key={item}
              size="md"
              fullWidth
              variant={
                filters.extras.includes(item) ? "contained" : "outlined"
              }
              onClick={() => toggleOption(item, "extras")}
            >
              {item}
            </CButton>
          ))}
        </div>
      </div>

      {/* Clear All */}
      <div className="text-right">
        <CButton
          size="sm"
          variant="text"
          onClick={() => {
            setFilters({
              gender: "",
              occupancy: "",
              price: [1000, 50000],
              rentCycle: "",
              gracePeriod: "",
              amenities: [],
              extras: [],
            });
            onFilterChange({});
          }}
        >
          Clear All
        </CButton>
      </div>
    </div>
  );
}
