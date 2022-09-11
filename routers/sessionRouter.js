import express from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { isLogged } from '../middlewares/authentificationMiddlewares.js';

const router = express.Router();

router.use(isLogged);

router.get('/session', sessionController.get);
router.delete('/logout', sessionController.logout);

export default router;