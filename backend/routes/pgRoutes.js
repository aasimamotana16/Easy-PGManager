
import express from "express";
import { searchPGs } from "../controllers/pgController.js";

const router = express.Router();

// SEARCH PGs WITH FILTERS
router.get("/search", searchPGs);

export default router;