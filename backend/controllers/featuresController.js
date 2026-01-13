const Feature = require("../models/featureModel");

// camelCase function name
const getHomeFeatures = async (req, res) => {
  try {

    const homeFeatures = await Feature.find({ category: "home" }); 
    res.status(200).json(homeFeatures);
    //const allFeatures = await Feature.find();
   // res.status(200).json(allFeatures);
  } catch (err) {
    res.status(500).json({ message: "Error fetching features", error: err });
  }
};

module.exports = { getHomeFeatures };