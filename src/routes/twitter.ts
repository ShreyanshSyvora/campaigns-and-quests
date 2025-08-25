import { authTwitter } from "../controllers/twitterAuth.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

import { Router } from "express";
const router = Router();

router.post("/link", isAuthenticated, authTwitter);

export default router;