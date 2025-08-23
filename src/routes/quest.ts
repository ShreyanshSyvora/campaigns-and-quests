import express,{Request,Response} from 'express';
const router = express.Router();

import {updateQuest, deleteQuest} from '../controllers/quest.js';

router.put("/:id", updateQuest);
router.delete("/:id", deleteQuest);


export default router;