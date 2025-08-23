import express, { Request, Response } from 'express';

import { Campaign } from '../models/Campaign.js';
import { Quest } from "../models/Quest.js";

export const listCampaign = async (req: Request, res: Response) => {
    try {
        const campaigns = await Campaign.find()
        .populate("quests");
        //    .populate("owner", "username wallet_address twitter_id")

        res.json(campaigns);

    } catch (err: any) {
        res.status(500).json({ message: "Error listing campaign", err });
    }
}

export const showCampaign = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const campaign = await Campaign.findById(id)
        .populate("quests");
        //  .populate("owner", "username wallet_address twitter_id");

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        res.json(campaign);
    } catch (err: any) {
        res.status(500).json({ message: "Error showing campaign", err });
    }

}

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body; //owner to be added

        const campaign = new Campaign({
            name,
            description, //owner to be added
            participants: [],
            quests: [],
        });

        await campaign.save();
        res.status(201).json(campaign);
    } catch (err: any) {
        res.status(500).json({ message: "Error creating campaign", err });
    }
}

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCampaign = await Campaign.findByIdAndDelete(id);
        if (!deletedCampaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        res.json({ message: "Campaign deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting campaign", err });
    }
}

export const addQuestToCampaign = async (req: Request, res: Response) => {
     
    try {
    const { id } = req.params;
    const { title, description, type, required_link, points_offered } = req.body;

    
    const quest = new Quest({
      title,
      description,
      type,
      required_link,
      points_offered,
      campaign_id: id,
    });
    await quest.save();

    
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { $push: { quests: quest._id } },
      { new: true }
    ).populate("quests");

    res.status(201).json({ campaign, quest });
  } catch (error) {
    res.status(500).json({ message: "Error adding quest to campaign", error });
  }
}