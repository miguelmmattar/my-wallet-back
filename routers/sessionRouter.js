import express from 'express';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.get('/session', sessionController.get);
router.delete('/logout', sessionController.logout);

export default router;