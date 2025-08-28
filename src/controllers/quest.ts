import express, { Request, Response } from "express";
import { Campaign } from "../models/Campaign.js";
import { Quest } from "../models/Quest.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import twitterApi from "../utils/twitterApi.js";
import { User } from "../models/User.js";
import { CampaignOwner } from "../models/CampaignOwner.js";
import { Types } from "mongoose";
import axios from 'axios';
import Sentiment from "sentiment";
import dotenv from "dotenv";
dotenv.config();
import { extractTweetId, extractTwitterUsername } from "../utils/twitterApi.js";

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
    res.json({success:true, quest: quest});
  } catch (err: any) {
    res.status(500).json({ message: "Error updating quest", error: err.message });
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

    res.json({ success:true, message: "Quest deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Error deleting quest", error: err.message });
  }
};

export const verifyQuest = async (req: AuthRequest, res: Response) => {
  try {
    const questId = req.params.id;
    const userId = req.user?.id;

    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).json({ message: "Quest not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.twitter_id === "pending") {
      return res.status(400).json({ message: "User has not linked Twitter" });
    }

    if (user.completed_quests.some((q) => q.toString() === (quest._id as import("mongoose").Types.ObjectId | string).toString())) {
      return res.status(400).json({ message: "Quest already completed" });
    }

    let success = false;

    // API FOR FOLLOW_TWITTER
    if (quest.type === "follow_twitter") {
      const targetUsername = extractTwitterUsername(quest.required_link);

      if (!targetUsername) {
        return res.status(400).json({ message: "Invalid Twitter profile link in quest" });
      }

      const resp = await twitterApi.get(`/users/by/username/${targetUsername}`);
      const data = resp.data as { data?: { id: string; username: string } };
      if (!data.data) {
        return res.status(400).json({ message: "Could not resolve Twitter user from username" });
      }
      const twitterUser = data.data.id;

      const options = {
        method: "GET",
        url: "https://twitter241.p.rapidapi.com/followings",
        params: {
          user: user.twitter_id,
          count: 50
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "twitter241.p.rapidapi.com"
        }
      };
      const response = await axios.request(options);
      const followingsData = response.data as { result?: { timeline?: { instructions?: any[] } } };
      const instructions = followingsData.result?.timeline?.instructions || [];
      const entries = instructions.find((inst: any) => inst.entries)?.entries || [];

      const followings = entries
        .map((entry: any) => entry.content?.itemContent?.user_results?.result)
        .filter(Boolean)
        .map((u: any) => u.rest_id);

      if (followings.includes(twitterUser)) {
        success = true;
      }
    }

    // API FOR RETWEET_TWEET
    if (quest.type === "retweet_tweet") {
      const tweetId = extractTweetId(quest.required_link);
      if (!tweetId) {
        return res.status(400).json({ message: "Invalid Tweet link in quest" });
      }

      const options = {
        method: "GET",
        url: "https://twitter241.p.rapidapi.com/user-tweets",
        params: {
          user: user.twitter_id,
          count: "50"
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "twitter241.p.rapidapi.com"
        }
      };

      const response = await axios.request(options);
      const data = response.data as { result?: { timeline?: { instructions?: any[] } } };
      const instructions = data.result?.timeline?.instructions || [];
      const entries = instructions.find((inst: any) => inst.entries)?.entries || [];

      const retweetedIds = entries
        .map((e: any) => e.content?.itemContent?.tweet_results?.result)
        .filter((tweet: any) => tweet?.legacy?.retweeted_status_result)
        .map((tweet: any) => tweet.legacy?.retweeted_status_result?.result?.rest_id);

      if (retweetedIds.includes(tweetId)) {
        success = true;
      }
    }

    // API FOR TWEET_TAG
    if (quest.type === "tweet_tag") {
      if (!req.body.tweetUrl) {
        return res.status(400).json({ message: "Tweet URL is required" });
      }

      const match = req.body.tweetUrl.match(/status\/(\d+)/);
      if (!match) {
        return res.status(400).json({ message: "Invalid Tweet URL" });
      }
      const tweetId = match[1];

      const options = {
        method: "GET",
        url: "https://twitter241.p.rapidapi.com/tweet",
        params: { pid: tweetId },
        headers: {
          "x-rapidapi-key": "da02eed8f8mshaa09fc4f79bf51fp145e55jsn6d6a4d57ef4b",
          "x-rapidapi-host": "twitter241.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);

      const resData: any = response.data;

      const entries =
        resData?.data?.threaded_conversation_with_injections_v2?.instructions?.find(
          (ins: any) => ins.type === "TimelineAddEntries"
        )?.entries || [];

      const tweetEntry = entries.find((e: any) =>
        e.entryId.startsWith("tweet-")
      );

      if (!tweetEntry) {
        return res
          .status(400)
          .json({ message: "Could not fetch Tweet details" });
      }

      const tweetData =
        tweetEntry.content?.itemContent?.tweet_results?.result?.legacy;

      if (!tweetData) {
        return res
          .status(400)
          .json({ message: "Tweet data missing in response" });
      }

      const mentions = tweetData.entities?.user_mentions || [];
      const tweetText = tweetData.full_text;

      const handleMatch = quest.required_link.match(/twitter\.com\/([^/]+)/);
      if (!handleMatch) {
        return res.status(400).json({ message: "Invalid required_link in quest" });
      }
      const requiredHandle = handleMatch[1].toLowerCase();

      const tagged = mentions.some(
        (m: any) => m.screen_name.toLowerCase() === requiredHandle
      );

      if (tagged) {
        success = true;
      }
      const sentiment = new Sentiment();
      const analysis = sentiment.analyze(tweetText);

      let rewardPoints = 0;
      if (analysis.score > 0) {
        rewardPoints = quest.points_offered;
      } else if (analysis.score === 0) {
        rewardPoints = Math.floor(quest.points_offered / 2);
      } else {
        rewardPoints = 0;
      }
      if (rewardPoints > 0) {
        quest.points_offered = rewardPoints; 
        success = true;
      } else {
        return res.status(400).json({ message: "Tweet sentiment is not positive. No points awarded." });
      }

    }

    if (!success) {
      return res.status(400).json({ message: "Quest not yet completed" });
    }

    user.completed_quests.push(quest._id as import("mongoose").Types.ObjectId);
    user.loyalty_points += quest.points_offered;
    await user.save();

    const campaign = await Campaign.findById(quest.campaign_id);

    if (campaign) {
      const alreadyParticipant = campaign.participants.some(
        (p) => p.toString() === userId
      );

      if (!alreadyParticipant) {
        campaign.participants.push(new Types.ObjectId(userId));
        await campaign.save();
      }
    }

    await campaign?.save();

    return res.json({
      success: true,
      message: "Quest verified successfully",
      points_awarded: quest.points_offered,
      total_points: user.loyalty_points,
      quest_id: quest._id,
    });
  } catch (err: any) {
    return res.status(500).json({ message: "Error verifying quest", err: err.message });
  }
};