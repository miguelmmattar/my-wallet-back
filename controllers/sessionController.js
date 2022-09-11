import db from '../db/db.js';

async function get(req, res) {
    const session = res.loals.session;

    try {
        res.send(session);
    } catch(error) {
        res.status(500).send(error.message);
    }
}

async function logout(req, res) {
    const session = res.locals.session;

    try {
        await db
            .collection('sessions')
            .deleteOne({ token: session.token });

        res.sendStatus(200);
    } catch(error) {
        res.status(500).send(error.message);
    }
}

export {
    get,
    logout
};