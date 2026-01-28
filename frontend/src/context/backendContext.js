import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BackendContext = createContext();
export const BackendProvider = ({ children }) => {
  const [pgList, setPgList] = useState([]); // camelCase [cite: 2026-01-01]

  // Change 'city = ""' to 'filters = {}' to handle all filter data
  const fetchLivePgs = async (filters = {}) => {
    try {
      // 1. Get the current city from the URL automatically
      const urlParams = new URLSearchParams(window.location.search);
      const currentCity = urlParams.get("city") || "";

      // 2. Combine the city with all filter data (Budget, Gender, etc.)
      const response = await axios.get('http://localhost:5000/api/pg/all', {
        params: { 
          city: currentCity, 
          ...filters // This spreads all your filter inputs into the request [cite: 2026-01-06]
        }
      });

      if (response.data.success) {
        setPgList(response.data.data); 
      }
    } catch (error) {
      console.error("Connection to backend failed:", error);
    }
  };

  useEffect(() => {
    fetchLivePgs();
  }, []);

  return (
    <BackendContext.Provider value={{ pgList, fetchLivePgs }}>
      {children}
    </BackendContext.Provider>
  );
};