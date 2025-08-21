import mongoose, {Types, Schema, Document} from 'mongoose';

export interface ICampaign extends Document{
   name:string,
   description:string,
   quests:Types.ObjectId,
   participants:Types.ObjectId,
   owner:Types.ObjectId
}

const CampaignSchema = new Schema<ICampaign>({
     name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    quests:[{
        type:Schema.Types.ObjectId,
        ref:"Quest"
    }],
    participants:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    owner:[{
        type:Schema.Types.ObjectId,
        ref:"CampaignOwner",
        required:true
    }]
},
{timestamps:true}
);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);

