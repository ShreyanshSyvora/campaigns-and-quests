import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err:any) {
    res.status(401).json({ msg: "Invalid token", error:err.message });
  }
};

export const isCampaignOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "campaignOwner") {
    return res.status(403).json({ msg: "Only campaign owners allowed" });
  }
  next();
};

