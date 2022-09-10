import express, { json } from 'express';
import joi from 'joi';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { MongoClient, ObjectId } from 'mongodb';
import dayjs from 'dayjs';
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

const transactionSchema = joi.object({
    value: joi.number().positive().precision(2).required(),
    description: joi.string().empty().required(),
    type: joi.valid('entrada', 'saida').required()
});

mongoClient.connect(() => {
    db = mongoClient.db('my-wallet');
});

app.use(cors());
app.use(express.json());

app.post('/auth/sign-up', async (req, res) => {
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
                email,
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

app.get('/auth/login', async (req, res) => {
    const { authorization } = req.headers;
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

        res.send(session);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.post('/new', async (req, res) => {
    const { value, description, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        const validation = transactionSchema.validate(req.body, { abortEarly: false });

        if(validation.error) {
            const errors = validation.error.details.map(detail => detail.message);
            res.status(422).send(errors);
            return;
        }

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

        await db
            .collection('transactions')
            .insertOne({
                userId: session.userId,
                value,
                description,
                type,
                date: dayjs().format('DD/MM')
            });
        
        res.sendStatus(200);
    } catch(error) {
        res.status(500).send(error.message);
    }

});

app.get('/panel', async (req, res) => {
    const { authorization } = req.headers;
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

        const transactions = await db
            .collection('transactions')
            .find({ userId: session.userId })
            .toArray();
        
        res.send(transactions);

    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.delete('/logout', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        if(!token) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        const session = await db
        .collection('sessions')
        .find({ token });

        if(!session) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        await db
            .collection('sessions')
            .deleteOne({ token });

        res.sendStatus(200);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.delete('/remove/:transactionId', async (req, res) => {
    const id = req.params.transactionId;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        if(!token) {
            res.status(401).send('Sessão expirada! Faça o login para continuar.');
            return;
        }

        await db
            .collection('transactions')
            .deleteOne({ _id: ObjectId(id) });

        res.sendStatus(200);
    } catch(error) {
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => console.log('Listening on port 5000'));
