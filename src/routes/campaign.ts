import express,{Request,Response} from 'express';
const router = express.Router();

import {showCampaign, listCampaign, deleteCampaign, createCampaign , addQuestToCampaign} from '../controllers/campaign.js';

router.get("/", listCampaign);

router.post("/", createCampaign);

router.get("/:id", showCampaign);

router.delete("/:id", deleteCampaign);

router.post("/:id/quests", addQuestToCampaign);


export default router;