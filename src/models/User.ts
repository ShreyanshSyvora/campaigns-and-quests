import mongoose, {Schema, Document, Types} from 'mongoose';

export interface IUser extends Document { 
    username:string;
    wallet_address:string;
    twitter_id:string;
    loyalty_points:number;
    completed_quests:Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
    {
        username:{
            type:String,
            required:true
        },
        wallet_address:{
            type:String,
            required:true
        },
        twitter_id:{
            type:String
        },
        loyalty_points:{
            type:Number,
            default:0
        },
        completed_quests:[{
            type:Schema.Types.ObjectId,
            ref:"Quest"
        }],
    },
    {timestamps:true}
);

export const User = mongoose.model<IUser>("User", UserSchema);






