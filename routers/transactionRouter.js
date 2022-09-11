import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { transactionSchema } from '../middlewares/scheemaValidationMiddlewares.js';
import { isLogged } from '../middlewares/authentificationMiddlewares.js';

const router = express.Router();

router.use(isLogged);

router.post('/new', transactionSchema, transactionController.add);
router.get('/panel', transactionController.get);
router.delete('/remove/:transactionId', transactionController.remove);

export default router;
