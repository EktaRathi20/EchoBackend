import express from "express";
import cors from 'cors';
import { connection } from "./config/mongoDb";
import { MRoute } from "./middleware/routeMiddleware";
import { RUser } from "./routes";

const app : express.Application = express();
const host : string = 'localhost';
const port : number = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(MRoute);
app.use('/api', RUser );

app.listen(port, host, async ()=>{
    await connection();
    console.log("API_PATH: ", `${host}:${port}/api`);
})