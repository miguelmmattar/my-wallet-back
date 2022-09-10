import db from '../db/db.js';
import joi from 'joi';
import { ObjectId } from 'mongodb';

const transactionSchema = joi.object({
    value: joi.number().positive().precision(2).required(),
    description: joi.string().empty().required(),
    type: joi.valid('entrada', 'saida').required()
});

async function add(req, res) {
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

}

async function get(req, res) {
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
}

async function remove(req, res) {
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
}

export {
    add,
    get,
    remove
};

