import express, { Request, Response } from "express";
import { Campaign } from "../models/Campaign.js";
import { Quest } from "../models/Quest.js";
import { AuthRequest } from "../middleware/authMiddleware.js"; 


export const updateQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;


    const quest = await Quest.findById(id);
    if (!quest) return res.status(404).json({ message: "Quest not found" });

 
    const campaign = await Campaign.findById(quest.campaign_id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

 
    if (campaign.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized to update this quest" });
    }

   
    const allowedUpdates = ["title", "description", "type", "required_link", "points_offered"];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        (quest as any)[key] = req.body[key];
      }
    }

    await quest.save();
    res.json(quest);
  } catch (err) {
    res.status(500).json({ message: "Error updating quest", error: err });
  }
};

export const deleteQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const quest = await Quest.findById(id);
    if (!quest) return res.status(404).json({ message: "Quest not found" });

    const campaign = await Campaign.findById(quest.campaign_id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

  
    if (campaign.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized to delete this quest" });
    }


    await Campaign.findByIdAndUpdate(quest.campaign_id, {
      $pull: { quests: quest._id },
    });

    await quest.deleteOne();

    res.json({ message: "Quest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quest", error: err });
  }
};
