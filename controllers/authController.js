import db from '../db/db.js';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const signUpSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(8).required(),
    confirm_password: joi.ref('password')
});

async function signUp(req, res) {
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
 }

 async function signIn(req, res) {
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
}

 export {
     signUp,
     signIn
 };