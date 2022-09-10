import express from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.post('/new', transactionController.add);
router.get('/panel', transactionController.get);
router.delete('/remove/:transactionId', transactionController.remove);

export default router;
