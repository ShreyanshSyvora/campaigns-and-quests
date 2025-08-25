import express,{Request,Response} from 'express';
const router = express.Router();

import { isAuthenticated, isCampaignOwner } from "../middleware/authMiddleware.js";
import {updateQuest, deleteQuest} from '../controllers/quest.js';

router.put("/:id",isAuthenticated, isCampaignOwner, updateQuest);
router.delete("/:id",isAuthenticated, isCampaignOwner, deleteQuest);

export default router;