const PG = require("../models/pgModel");

exports.getGujaratCities = async (req, res) => {
  try {
    const baseCities = [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Gandhinagar", "Nadiad", "Anand"
    ];

    const [citiesFromCityField, citiesFromLocationField] = await Promise.all([
      PG.distinct("city", { city: { $exists: true, $ne: "" } }),
      PG.distinct("location", { location: { $exists: true, $ne: "" } }),
    ]);

    const merged = [...baseCities, ...citiesFromCityField, ...citiesFromLocationField]
      .map((c) => String(c || "").trim())
      .filter(Boolean);

    const uniqueCities = [...new Set(merged)].sort((a, b) => a.localeCompare(b));
    return res.status(200).json(uniqueCities);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch cities" });
  }
};
