import mongoose, {Types, Document, Schema} from 'mongoose';

export interface ICampaignOwner extends Document{
    username:String;
    wallet_address:String;
    twitter_id:String;
    campaigns:Types.ObjectId;
}

const CampaignOwnerSchema = new Schema<ICampaignOwner>({
    username:{
        type:String,
        required:true
    },
    wallet_address:{
        type:String,
        required:true
    },
    twitter_id:{
        type:String,
        required:true
    },
    campaigns:[{
        type:Schema.Types.ObjectId,
        ref:"Campaign"
    }],
},
{timestamps:true}
);

export const CampaignOwner = mongoose.model<ICampaignOwner>("CampaignOwner", CampaignOwnerSchema);