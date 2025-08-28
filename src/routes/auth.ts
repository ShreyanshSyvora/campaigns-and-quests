import { Router } from "express";
import { getNonce, verifySignature } from "../controllers/auth.js";
import { isAuthenticated, isCampaignOwner } from "../middleware/authMiddleware.js";
const router = Router();

router.post("/get-nonce", getNonce);
router.post("/verify", verifySignature);

export default router;