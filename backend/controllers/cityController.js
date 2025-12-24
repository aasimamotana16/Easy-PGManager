import City from "../models/cityModel.js";

export const getCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cities" });
  }
};

// Only run once to insert Gujarat cities
export const addDefaultCities = async () => {
  const cities = [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Nadiad",
    "Anand",
    "Bharuch",
    "Valsad",
    "Vapi",
    "Navsari",
  ];

  const existing = await City.find();
  if (existing.length > 0) return;

  await City.insertMany(cities.map(name => ({ name })));
  console.log("Default Gujarat cities added ✔");
};