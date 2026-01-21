exports.getGujaratCities = (req, res) => {
  const gujaratCities = [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", 
    "Jamnagar", "Gandhinagar", "Nadiad", "Anand" 
    
  ];
  // This sends the array to the frontend
  res.status(200).json(gujaratCities);
};