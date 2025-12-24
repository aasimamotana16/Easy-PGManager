import express from "express";
import City from "../models/cityModel.js";

const router = express.Router();

// Insert Gujarat Cities (run once)
router.get("/insert-gujarat-cities", async (req, res) => {
  try {
    const cities = [
      { name: "Ahmedabad" },
      { name: "Surat" },
      { name: "Vadodara" },
      { name: "Rajkot" },
      { name: "Bhavnagar" },
      { name: "Jamnagar" },
      { name: "Gandhinagar" },
      { name: "Junagadh" },
      { name: "Anand" },
      { name: "Navsari" }
    ];

    await City.insertMany(cities);
    res.json({ message: "Gujarat cities inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cities
router.get("/", async (req, res) => {
  const allCities = await City.find();
  res.json(allCities);
});

export default router;