import db from '../db/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

async function signUp(req, res) {
    const { name, email, password } = req.body;
 
    try {
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
 }

 async function signIn(req, res) {
    try {
        const token = uuid();
        const user = res.locals.user;

        await db
            .collection('sessions')
            .insertOne({
                userId: user._id,
                email: user.email,
                token
            });

        res.status(200).send({
            name: user.name,
            token
        });        

    } catch(error) {
        res.status(500).send(error.message);
    }
}

 export {
     signUp,
     signIn
 };