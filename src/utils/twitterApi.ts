import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

const twitterAPI = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

export default twitterAPI;