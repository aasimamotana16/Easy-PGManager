import React, { useState } from "react";
import CButton from "../../components/cButton";
import CSelect from "../../components/cSelect";

const HomeSearch = () => {
  const [city, setCity] = useState("");

  const handleSearch = (type) => {
    if (!city) {
      alert("Please select a city first!");
      return;
    }
    window.location.href = `/search?city=${city}&type=${type}`;
  };

  return (
    <section className="px-6 pt-2 pb-10 bg-background.DEFAULT">
      <div className="max-w-3xl mx-auto">

        {/* SEARCH CARD */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-card hover:shadow-hover transition text-center">

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
            Find PGs & Hostels Near You
          </h2>

          <p className="text-sm sm:text-base text-text-secondary mb-6">
            Choose your city and accommodation type to get started.
          </p>

          {/* CITY SELECT */}
          <div className="max-w-md mx-auto mb-6">
            <CSelect
              label="Select City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={["Nadiad", "Ahemdabad","Surat","Baroda","Navsari"]}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <CButton
              onClick={() => handleSearch("pg")}
              text="Paying Guest"
              variant="contained"
              className="flex-1 py-3 rounded-xl text-base font-semibold"
            />

            <CButton
              onClick={() => handleSearch("hostel")}
              text="Hostel Stay"
              variant="contained"
              className="flex-1 py-3 rounded-xl text-base font-semibold"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default HomeSearch;
