import db from '../db/db.js';
import bcrypt from 'bcrypt';

async function isLogged(req, res, next) {
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

        res.locals.session = session;
    } catch(error) {
        res.status(500).send(error.message);
    }

    next();
}

async function isRegistered(req, res, next) {
    const { email } = req.body;

    const user = await db
             .collection('users')
             .findOne({email: email});
 
         if(user) {
             res.status(409).send('Este e-mail já está cadastrado!');
             return;
         }

    next();
}

async function allowLogin(req, res, next) {
    const { email, password } = req.body;

    try {
        const user = await db
            .collection('users')
            .findOne({ email });

        if(!user) {
            res.status(401).send('E-mail ou senha inválidos!');
        }
    
        if(!bcrypt.compareSync(password, user.encrypted_password)) {
        res.status(401).send('E-mail ou senha inválidos!');
        }
        
        res.locals.user = user; 

    } catch(error) {
        res.status(500).send(error.message);
    }

    next();
}

export {
    isLogged,
    isRegistered,
    allowLogin
};