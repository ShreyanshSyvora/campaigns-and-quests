Date - 20 August 2025 : 
-> Completed the documentation of the project.

Date - 21 August 2025 :
-> I firstly learnt TS.
-> Then move to converting my JS app.js to app.ts.
-> Understood how the things are to be performed like builds, etc.
-> Then I created a PR of initial-setup where i pushed all the folder structure and a basic setup alongwith db connections,
-> Started with Database schema creation.

Date - 22 August 2025 :
-> Completed the Database Schema Creation and raised PR.
-> I created the CRUD routes for Campaigns.
-> Created the routes like : listCampaign, showCampaign, createCampaign, deleteCampaign, addQuestToCampaign.
-> Also created routes like updateQuest and deleteQuest.
-> Currently solving an error then will further continue with authentication.

Date - 25 August 2025 :
-> Started with authentication where I performed authentication via wallet address where firstly created the nonce string and then verified the signature payload with the original wallet address.
-> Created the middlewares for authorization like : isAuthenticated and isCampaignOwner
-> Added the required middlewares in the various routes.

Date - 26 August 2025 :
-> Created the understanding of how the twitter apis work.
-> Added twitter linkage to generate user_id from twitter_handle of the user as well as campaign owners.
-> Created the quest verification route where added things like rewarding loyalty points, appending of user to participants of campaigns and added some checks.
-> Started with the quest_type "twitter_follow" but could not fetch the data since it can be possible only with the enterprise subscription.
-> Currently looking for the alternatives like discord or telegram to again implement in my project for free.

Date - 28 August 2025
-> Completed the quest verification route using Rapid api, where implemented the verification of quests like follow_twitter, retweet_tweet and tag tweet.
-> tag_tweet also consists of reward distribution on the basis of sentiment of the particular tweet, like full points for positive, no point for negative and half points will be rewarded for the neutral ones.
-> Implemented the feature of the campaign expiration where campaign owner can explicitely set the expiry of the campaign while creation.
-> Performed fine tuning of the responses as directed.