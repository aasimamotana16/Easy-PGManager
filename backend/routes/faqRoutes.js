import express from "express";
import { getFaqs, addFaq } from "../controllers/faqController.js";

const router = express.Router();

router.get("/", getFaqs);      // GET all FAQs
router.post("/", addFaq);      // Add new FAQ

export default router;