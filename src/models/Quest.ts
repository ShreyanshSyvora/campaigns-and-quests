import mongoose, {Document, Schema, Types} from 'mongoose';

export type QuestType = "follow_twitter" | "like_tweet" | "retweet_tweet" | "tweet_tag";

export interface IQuest extends Document{
    title:string;
    description:string;
    required_link:string;
    points_offered:number;
    campaign_id:Types.ObjectId;
    type:QuestType;
}

const QuestSchema = new Schema<IQuest>({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    required_link:{
        type:String,
        reqired:true
    },
    points_offered:{
        type:Number,
        required:true
    },
    campaign_id:{
        type:Schema.Types.ObjectId,
        ref:"Campaign",
        required:true
    },
    type:{
        type:String,
        enum:["follow_twitter", "like_tweet", "retweet_tweet", "tweet_tag"],
        required:true
    },
},
{timestamps:true}
);

export const Quest = mongoose.model<IQuest>("Quest", QuestSchema);