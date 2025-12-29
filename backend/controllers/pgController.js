import PG from "../models/pgModel.js";

export const searchPGs = async (req, res) => {
    console.log("pg search api hit");
    resjson({ message: "search route working"});
  try {
    const {
      lookingFor,
      occupancy,
      minPrice,
      maxPrice,
      rentCycle,
      amenities
    } = req.query;

    const filter = {};

    if (lookingFor) filter.lookingFor = lookingFor;
    if (occupancy) filter.occupancy = occupancy;
    if (rentCycle) filter.rentCycle = rentCycle;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      filter.amenities = { $all: amenities.split(",") };
    }

    const pgs = await PG.find(filter);
    res.status(200).json(pgs);

  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};