import db from '../db/db.js';

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

        res.send(session);
    } catch(error) {
        res.status(500).send(error.message);
    }
}

async function logout(req, res) {
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
}

export {
    get,
    logout
};