import express, { json } from 'express';
import joi from 'joi';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
dotenv.config();

const app = express();
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db('my-wallet');
});

app.use(cors());
app.use(express.json());


app.listen(5000, () => console.log('Listening on port 5000'));
