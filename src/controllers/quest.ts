import express, { Request, Response } from 'express';

import { Campaign } from '../models/Campaign.js';
import { Quest } from "../models/Quest.js";



export const updateQuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const allowedUpdates = ['title', 'description', 'type', 'required_link', 'points_offered']; 
    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedQuest = await Quest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    res.json(updatedQuest);
  } catch (err) {
    res.status(500).json({ message: "Error updating quest", error: err });
  }
};



export const deleteQuest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quest = await Quest.findById(id);
        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        await Campaign.findByIdAndUpdate(quest.campaign_id, {
            $pull: { quests: quest._id }
        });


        await quest.deleteOne();

        res.json({ message: "Quest deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error Deleting Quest", error: err })
    }
}