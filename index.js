import express from 'express';
import cors from 'cors';
import { signUp, signIn } from './controllers/authController.js';
import { getSession, logout } from './controllers/sessionController.js';
import { newTransaction,getTransactions, removeTransaction } from './controllers/transactionController.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/auth/sign-up', signUp);

app.post('/auth/login', signIn);

app.get('/session', getSession);

app.delete('/logout', logout);

app.post('/new', newTransaction);

app.get('/panel', getTransactions);

app.delete('/remove/:transactionId', removeTransaction);

app.listen(5000, () => console.log('Listening on port 5000'));
