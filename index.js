import express, { json } from 'express';
import joi from 'joi';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
dotenv.config();

const app = express();
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const signUpSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(8).required(),
    confirm_password: joi.ref('password')
});

mongoClient.connect(() => {
    db = mongoClient.db('my-wallet');
});

app.use(cors());
app.use(express.json());

app.post('/sign-up', async (req, res) => {
   const { name, email, password } = req.body;

   try {
        const validation = signUpSchema.validate(req.body, { abortEarly: false });

        if(validation.error) {
            const errors = validation.error.details.map(detail => detail.message);
            res.status(422).send(errors);
            return;
        }

        const response = await db
            .collection('users')
            .findOne({email: email});

        if(response) {
            res.status(409).send('Este e-mail já está cadastrado!');
            return;
        }

        await db
            .collection('users')
            .insertOne({
                name,
                email,
                encrypted_password: bcrypt.hashSync(password, 10)
            });
    
        res.sendStatus(200);    
   } catch(error) {
       res.status(500).send(error.message);
   }
});


app.listen(5000, () => console.log('Listening on port 5000'));
