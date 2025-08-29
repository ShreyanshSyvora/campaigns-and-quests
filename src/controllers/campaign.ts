import express, { Request, Response } from "express";
import { Campaign } from "../models/Campaign.js";
import { Quest } from "../models/Quest.js";
import { CampaignOwner } from "../models/CampaignOwner.js";

interface AuthRequest extends Request {
  user?: { id: string; wallet_address: string; role: "user" | "campaignOwner" };
}

export const listCampaign = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find()
      .populate("quests")
      .populate("owner", "username wallet_address twitter_id");

      for (const campaign of campaigns) {
        if (campaign.expiryDate && campaign.expiryDate < new Date()) {
          await campaign.deleteOne();
          console.log(`Deleted expired campaign: ${campaign._id}`);
        }
      }
    res.json({success:true, data:{campaigns:campaigns}});
  } catch (err: any) {
    res.status(500).json({success:false, data: {message: "Error listing campaign", err: err.message }});
  }
};

export const showCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findById(id)
      .populate("quests")
      .populate("owner", "username wallet_address twitter_id");

    if (!campaign) {
      return res.status(404).json({success:false, data:{message: "Campaign not found" }});
    }
    res.json({success:true, data:{campaign:campaign}});
  } catch (err: any) {
    res.status(500).json({ success:false,data:{message: "Error showing campaign", error: err.message } });
  }
};


export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "campaignOwner") {
      return res.status(403).json({success:false, data:{message: "Only campaign owners can create campaigns" }});
    }
    const { name, description, expiryDays } = req.body;
    let expiryDate: Date | undefined = undefined;

    if(!name || !description) {
      return res.status(400).json({success:false, data:{message: "Name and description are required" }});
    }

    if (expiryDays && !isNaN(Number(expiryDays))) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(expiryDays));
    }
    const campaign = new Campaign({
      name,
      description,
      owner: req.user.id,
      participants: [],
      quests: [],
      expiryDate
    });
    await campaign.save();

    await CampaignOwner.findByIdAndUpdate(req.user.id, {
      $push: { campaigns: campaign._id },
    });
    res.status(201).json({success:true,data:{campaign: campaign}});
  } catch (err: any) {
    res.status(500).json({success:false,data:{ message: "Error creating campaign", error: err.message }} );
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "campaignOwner") {
      return res.status(403).json({success:false, data:{ message: "Only campaign owners can delete campaigns" }});
    }
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ success:false, data:{message: "Campaign not found" }});
    }
    if (campaign.owner.toString() !== req.user.id) {
      return res.status(403).json({success:false, data:{ message: "You are not the owner of this campaign"} });
    }
    await campaign.deleteOne();
    res.json({success:true, data:{message: "Campaign deleted successfully" }});
  } catch (err:any) {
    res.status(500).json({ success:false, data:{message: "Error deleting campaign", error:err.message }} );
  }
};

export const addQuestToCampaign = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "campaignOwner") {
      return res.status(403).json({ successs:false, data:{message: "Only campaign owners can add quests"} });
    }
    const { id } = req.params; 
    const { title, description, type, required_link, points_offered } = req.body;

    if (!title || !description || !type || !required_link || !points_offered) {
      return res.status(400).json({ success:false, data:{message: "All quest fields are required" }});
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({success:false, data:{ message: "Campaign not found" }});
    }
    if (campaign.owner.toString() !== req.user.id) {
      return res.status(403).json({ success:false, data:{message: "You are not the owner of this campaign"} });
    }

    const quest = new Quest({
      title,
      description,
      type,
      required_link,
      points_offered,
      campaign_id: id,
    });
    await quest.save();
    campaign.quests.push(quest._id as import("mongoose").Types.ObjectId);
    await campaign.save();
    await campaign.populate("quests");
    res.status(201).json({success:true,  data:{campaign: campaign }});
  } catch (error:any) {
    res.status(500).json({ success:false, data:{message: "Error adding quest to campaign", error:error.message }});
  }
};