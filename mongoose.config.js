import mongoose from "mongoose";

import dotenv from "dotenv"

dotenv.config()
const DB_URL=process.env.DB_URL;

export const mongooseConnect= async()=>{
    try{
        await mongoose.connect(DB_URL);
        console.log("connected to mongoose");
    }
   
    catch(err)
    {
        console.log(err);
    }

}
