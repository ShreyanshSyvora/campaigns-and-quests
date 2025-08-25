import express,{Request,Response} from 'express';
const router = express.Router();
import { isAuthenticated, isCampaignOwner } from "../middleware/authMiddleware.js";
import {showCampaign, listCampaign, deleteCampaign, createCampaign , addQuestToCampaign} from '../controllers/campaign.js';

router.get("/", listCampaign);

router.post("/",isAuthenticated, isCampaignOwner, createCampaign);

router.get("/:id", showCampaign);

router.delete("/:id",isAuthenticated, isCampaignOwner, deleteCampaign);

router.post("/:id/quests",isAuthenticated, isCampaignOwner, addQuestToCampaign);

export default router;