import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BackendContext = createContext();
export const BackendProvider = ({ children }) => {
  const [pgList, setPgList] = useState([]); // camelCase state variable [cite: 2026-01-01]

  useEffect(() => {
    const fetchLivePgs = async () => {
      try {
        // 1. Grab city from URL using standard JS (Safest for today) [cite: 2026-01-06]
        const urlParams = new URLSearchParams(window.location.search);
        const selectedCity = urlParams.get("city");

        // 2. Pass city to your backend so console.log shows the city name [cite: 2026-01-06]
        const response = await axios.get('http://localhost:5000/api/pg/all', {
          params: { city: selectedCity } 
        });

        if (response.data.success) {
          setPgList(response.data.data); 
        }
      } catch (error) {
        console.error("Connection to backend failed:", error);
      }
    };

    fetchLivePgs();
    
    // 3. This tells React to refresh the list whenever the URL city changes [cite: 2026-01-06]
  }, [window.location.search]); 

  return (
    <BackendContext.Provider value={{ pgList }}>
      {children}
    </BackendContext.Provider>
  );
};