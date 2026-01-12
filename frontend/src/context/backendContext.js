import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BackendContext = createContext();

export const BackendProvider = ({ children }) => {
  const [pgList, setPgList] = useState([]); // camelCase state variable [cite: 2026-01-01]

  useEffect(() => {
    const fetchLivePgs = async () => {
      try {
        // Calling your backend API that you've already verified is working
        const response = await axios.get('http://localhost:5000/api/pg/all');
        if (response.data.success) {
          // Setting the list with data from your MongoDB
          setPgList(response.data.data); 
        }
      } catch (error) {
        console.error("Connection to backend failed:", error);
      }
    };
    fetchLivePgs();
  }, []);

  return (
    <BackendContext.Provider value={{ pgList }}>
      {children}
    </BackendContext.Provider>
  );
};