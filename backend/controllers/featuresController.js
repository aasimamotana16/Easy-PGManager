const Feature = require("../models/featureModel");

// camelCase function name
const getHomeFeatures = async (req, res) => {
  try {
    const homeFeatures = await Feature.find({ category: "home" }); 
    
    // If no features exist, return sample data
    if (homeFeatures.length === 0) {
      return res.status(200).json([
        {
          _id: "1",
          title: "Verified Properties",
          desc: "All PGs are verified and inspected for quality and safety",
          category: "home",
          iconName: "verified"
        },
        {
          _id: "2", 
          title: "24/7 Support",
          desc: "Round the clock customer support for all your needs",
          category: "home",
          iconName: "support"
        },
        {
          _id: "3",
          title: "Easy Booking",
          desc: "Simple and quick booking process with instant confirmation",
          category: "home", 
          iconName: "booking"
        },
        {
          _id: "4",
          title: "Secure Payments",
          desc: "Safe and secure payment gateway with multiple options",
          category: "home",
          iconName: "payment"
        }
      ]);
    }
    
    res.status(200).json(homeFeatures);
  } catch (err) {
    res.status(500).json({ message: "Error fetching features", error: err });
  }
};

module.exports = { getHomeFeatures };