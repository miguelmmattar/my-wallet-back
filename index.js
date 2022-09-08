import express, { json } from 'express';
import joi from 'joi';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
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

app.post('auth/sign-up', async (req, res) => {
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
    
        res.sendStatus(201);    
   } catch(error) {
       res.status(500).send(error.message);
   }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db
            .collection('users')
            .findOne({ email });

        if(!user && !bcrypt.compareSync(password, user.encrypted_password)) {
            res.status(401).send('E-mail ou senha inválidos!');
            return;
        }

        const token = uuid();

        await db
            .collection('sessions')
            .insertOne({
                userId: user._id,
                token
            });

        res.status(200).send({
            name: user.name,
            token
        });        

    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.get('/painel', async (req, res) => {
    const { authorization } = req.headers;
    console.log(authorization)
    const token = authorization?.replace('Bearer ', '');

    try {
        if(!token) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        const session = await db
            .collection('sessions')
            .findOne({ token });

        if(!session) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        const user = await db
            .collection('users')
            .findOne({ _id: session.userId });

        if(!user) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        delete user.encrypted_password;

        res.send(user);

    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => console.log('Listening on port 5000'));
