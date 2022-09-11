import db from '../db/db.js';
import { ObjectId } from 'mongodb';
import dayjs from 'dayjs';


async function add(req, res) {
    const { value, description, type } = req.body;
    const session = res.locals.session;

    try {
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
        console.log(error.message)
        res.status(500).send(error.message);
    }

}

async function get(req, res) {
    const session = res.locals.session;
    console.log(session)

    try {
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

    try {
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

