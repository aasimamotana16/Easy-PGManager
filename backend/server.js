import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cityRoutes from "./routes/cityRoutes.js";
import featuresRoutes from "./routes/featuresRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import { addDefaultCities} from"./controllers/cityController.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/home", featuresRoutes);
app.use("/api/faq", faqRoutes);
app.get('/', (req, res) => res.send('EasyPG Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
