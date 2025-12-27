import express from "express";
import { getFeatures } from "../controllers/featuresController.js";

const router = express.Router();

router.get("/", getFeatures);

export default router;