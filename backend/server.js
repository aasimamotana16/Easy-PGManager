const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes'); // Added this
const featuresRoutes = require("./routes/featuresRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// MIDDLEWARE
app.use(cors()); 
app.use(express.json());

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log(err));

// ROUTES
app.use('/auth', authRoutes);
app.use('/cities', cityRoutes); // Added this to match your frontend API call

// Add this near your other app.use statements
app.use("/api/users", require("./routes/userRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));