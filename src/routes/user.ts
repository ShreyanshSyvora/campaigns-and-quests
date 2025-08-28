import { CampaignOwner } from "../models/CampaignOwner.js";
import { User } from "../models/User.js";
import express, { Request, Response } from "express";
const router = express.Router();

router.get("/users", async(req:Request,res:Response)=>{
    try{
    const users = await User.find();
    res.json(users);
    } catch(err){
        res.status(400).json({"Error":err});
    }
})

router.get("/campaignOwners", async(req:Request,res:Response)=>{
    try{
    const campaignOwners = await CampaignOwner.find();
    res.json(campaignOwners);
    } catch(err){
        res.status(400).json({"Error":err});
    }
})

export default router;