import React from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const city = query.get("city");
  const type = query.get("type");

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Search Results</h1>
      <p>Showing <strong>{type}</strong> in <strong>{city}</strong></p>
    </div>
  );
};

export default SearchResults;