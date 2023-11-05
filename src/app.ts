import express from "express";
import cors from 'cors';
import { connectToDatabase } from "./config/MongoDbClient";
import { routeMiddleware } from "./middleware/RouteMiddleware";
import { userRoute } from "./routes/UserRoute";
import * as dotenv from 'dotenv';
dotenv.config();

const app: express.Application = express();
const host: string = 'localhost';
const port: number = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(routeMiddleware);
app.use('/api', userRoute);

app.listen(port, host, async () => {
    await connectToDatabase();
    console.log("API_PATH: ", `${host}:${port}/api`);
})