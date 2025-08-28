import express, { Request, Response } from 'express';
import { User } from '../models/User.js';
import { CampaignOwner } from '../models/CampaignOwner.js';
import { AuthRequest } from "../middleware/authMiddleware.js";
import twitterApi from "../utils/twitterApi.js";

export const authTwitter = async (req: AuthRequest, res: Response) => {
  try {
    const { handle } = req.body;
    const { id, role } = (req as any).user;

    if (!handle) {
      return res.status(400).json({ message: "Twitter handle is required" });
    }

    if (role !== "user" && role !== "campaignOwner") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const response = await twitterApi.get(`/users/by/username/${handle}`);
    const data = response.data as { data?: { id: string; username: string } };
    const twitterUser = data.data;

    if (!twitterUser) {
      return res.status(404).json({ message: "Twitter user not found" });
    }

    let updatedDoc;
    if (role === "user") {
      updatedDoc = await User.findByIdAndUpdate(id, { twitter_id: twitterUser.id }, { new: true });
    } else if (role === "campaignOwner") {
      updatedDoc = await CampaignOwner.findByIdAndUpdate(id, { twitter_id: twitterUser.id }, { new: true });
    }

    if (!updatedDoc) {
      return res.status(404).json({ message: "User/Campaign Owner not found" });
    }

    res.json({success:true, message: "Twitter account linked successfully", twitter_id: twitterUser.id, username: twitterUser.username, updatedDoc });
  } catch (err: any) {
    res.status(500).json({ message: "Error linking Twitter", error: err.message });
  }

};