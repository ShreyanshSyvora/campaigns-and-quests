import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import campaignRoutes from './routes/campaign.js';
import questRoutes from './routes/quest.js';
import mongoose from 'mongoose';
async function main() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in .env");
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
main();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/campaigns", campaignRoutes);
app.use("/quests", questRoutes);
app.all("", (req, res) => {
    res.status(404).send("Page Not Found!");
});
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).send(`Error : ${err}`);
});
app.listen(process.env.PORT, () => {
    console.log("Server is listening to port 8080");
});
