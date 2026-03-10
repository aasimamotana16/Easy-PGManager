const PG = require("../models/pgModel");

exports.getGujaratCities = async (req, res) => {
  try {
    const baseCities = [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Gandhinagar", "Nadiad", "Anand"
    ];

    const gujaratCityWhitelist = new Set([
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Gandhinagar", "Nadiad", "Anand", "Junagadh",
      "Navsari", "Vapi", "Valsad", "Mehsana", "Bhuj", "Porbandar",
      "Palanpur", "Surendranagar", "Bharuch", "Morbi", "Godhra",
      "Veraval", "Amreli", "Patan", "Dahod", "Ankleshwar"
    ]);

    const toTitleCase = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
        .trim();

    // Extract a probable city name from raw location/address text.
    const extractCityName = (raw) => {
      const text = String(raw || "").trim();
      if (!text) return "";

      const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return "";

      // If "Gujarat" exists in the string, pick the token immediately before it.
      const gujaratIndex = parts.findIndex((p) => /gujarat/i.test(p));
      if (gujaratIndex > 0) return toTitleCase(parts[gujaratIndex - 1]);

      // Otherwise treat the last comma-separated token as city.
      return toTitleCase(parts[parts.length - 1]);
    };

    const [citiesFromCityField, citiesFromLocationField] = await Promise.all([
      PG.distinct("city", { city: { $exists: true, $ne: "" } }),
      PG.distinct("location", { location: { $exists: true, $ne: "" } }),
    ]);

    const normalizedFromCity = citiesFromCityField.map((c) => toTitleCase(c));
    const normalizedFromLocation = citiesFromLocationField.map((c) => extractCityName(c));

    const merged = [...baseCities, ...normalizedFromCity, ...normalizedFromLocation]
      .map((c) => toTitleCase(c))
      .filter((c) => c && gujaratCityWhitelist.has(c));

    const uniqueCities = [...new Set(merged)].sort((a, b) => a.localeCompare(b));
    return res.status(200).json(uniqueCities);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch cities" });
  }
};
