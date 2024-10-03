import mongoose from "mongoose";

const chatSchema=new mongoose.Schema({
    userName:String,
    message:String,
    avatar:String,
    timestamp:Date
})
export const Chat=mongoose.model('Chat',chatSchema);