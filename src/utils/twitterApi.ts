import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

const twitterAPI = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});



function extractTweetId(tweetUrl: string): string | null {
  try {
    const url = new URL(tweetUrl);
    const parts = url.pathname.split("/");
    
    const statusIndex = parts.findIndex((p) => p === "status");
    if (statusIndex !== -1 && parts[statusIndex + 1]) {
      return parts[statusIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
}


function extractTwitterUsername(profileUrl: string): string | null {
  try {
    const url = new URL(profileUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null; 
  } catch {
    return null;
  }
}



export { extractTweetId, extractTwitterUsername };
export default twitterAPI;