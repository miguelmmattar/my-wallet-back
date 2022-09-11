import express from 'express';
import cors from 'cors';
import authRouter from './routers/authRouter.js';
import sessionRouter from './routers/sessionRouter.js';
import transactionRouter from './routers/transactionRouter.js';


const app = express();

app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(sessionRouter);
app.use(transactionRouter);

app.listen(5000, () => console.log('Listening on port 5000'));