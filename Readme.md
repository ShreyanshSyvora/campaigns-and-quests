Campaign and Quest Documentation

Basic Flow of the Project :-

-> Campaign_owner creates campaigns and adds the quests.
-> Campaign consist of Quests such as : - Tag on Twitter Post,
						        		- Follow on Twitter,
						        		- Retweet on Twitter.
-> User logs in via wallet address.
-> User participate in Campaign.
-> User completes Quests and get Rewards.


Routes and their features :-

Authentication Routes -

-> POST /auth/get-nonce - It takes wallet address as input and it generates the random nonce and map it with the wallet address sent by user.

-> POST /auth/verify - It takes the signature and the requested role from the user along with that wallet address and that signature is verified with nonce which returns the wallet address, if the returned wallet address and the original wallet address mapped with that nonce are matched the user is verified. And the bearer token is returned to the client which was signed by jwt.


Campaign Routes - 

-> GET /campaigns - It lists all the campaigns available.

-> GET /campaigns/:id - It shows the particular campaign specifically.

-> POST /campaigns - It takes title, expiry and description of the campaign as an input. And creates a new campaign.

-> DELETE /campaigns/:id - It is used to delete the particular campaign.

-> POST /campaigns/:id/quests - It takes title, description, type, required_link, points_offered as an input. It is used to add quests in a particular campaign.


Twitter Link Route -

-> POST /twitter/link - It takes twitter handle of the user as an input and converts it into the twitter_id using twitter.api.v2 and stores it in the database.


Quest Routes -

-> PUT /quests/:id - It is used to update the particular quest. And can take title, description, type, required_link and points offered as an input.

-> DELETE /quests/:id - It is used to delete the particular quest.

-> GET /quests/:id/verify - It is used to verify whether the particular quest is completed by the user or not.
It is verifying quest types such as follow_twitter, retweet_tweet and tweet_tag where tweet_tag quest accepts the posted tweet link as an input where the user has tagged the account whose link was present in the quest.required_link.
Also tweet_tag consists of rewarding on the basis of sentiment analysis of the tweet, if positive sentiment then full points, if negative then no points and if neutral then half points.


User Routes -

-> GET /users - It lists all the users.

-> GET /campaignOwners - It lists all the campaign owners.



Middlewares :

-> isAuthenticated - It checks whether is authenticated as a user or not.

-> isCampaignOwner - It is used to check whether the user authenticated is whether the campaignOwner or not. It is to be always passed along with isAuthenticated in order to check whether the user is authenticated as a campaign owner or not.



Database Schemas : 

Campaign_owner :
-> username,
-> campaigns (ref),
-> wallet_address,
-> twitter_id

User :
-> username,
-> wallet_address,
-> twitter_id,
-> loyalty_points,
-> completed_quests (ref)

Campaign :
-> name,
-> description,
-> owner (ref),
-> participants (ref),
-> quests (ref),
-> createdAt,
-> expiryDate

Quests : 
-> title,
-> description,
-> required_link,
-> points_offered,
-> campaign_id,
-> type - [follow_twitter, retweet tweet, tweet_tag]