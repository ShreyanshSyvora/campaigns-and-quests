import { Request, Response } from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { CampaignOwner } from "../models/CampaignOwner.js";

const nonces: Record<string, string> = {}; 

export const getNonce = (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ success:false, data:{msg: "Address required" }});
  const nonce = Math.floor(Math.random() * 1000000).toString();
  nonces[address.toLowerCase()] = nonce;
  res.json({success:true, data:{nonce:nonce}});
};

export const verifySignature = async (req: Request, res: Response) => {
  const { address, signature, role } = req.body;
  const nonce = nonces[address.toLowerCase()];
  if (!nonce) return res.status(400).json({ success:false, data:{msg: "Nonce not found"} });
  if (!address || !signature || !role) {
    return res.status(400).json({ success:false, data:{msg: "Address, signature, and role are required" }});
  }
  try {
    const recovered = ethers.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.json({ success: false, data:{msg: "Verification failed" }});
    }
    let account;
    if (role === "campaignOwner") {
      account = await CampaignOwner.findOne({ wallet_address: address });
      if (!account) {
        account = await CampaignOwner.create({
          username: "Owner_" + Date.now(),
          wallet_address: address,
          twitter_id: "pending",
          campaigns: [],
        });
      }
    } else {
      account = await User.findOne({ wallet_address: address });
      if (!account) {
        account = await User.create({
          username: "User_" + Date.now(),
          wallet_address: address,
          twitter_id: "pending",
          loyalty_points: 0,
          completed_quests: [],
        });
      }
    }
    const token = jwt.sign(
      { id: account._id, role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    res.json({ success: true, data:{msg: "Authenticated", token:token, role:role }});
  } catch (err:any) {
    res.json({ success: false, data:{msg: "Error verifying", error: err.message}});
  }
};

