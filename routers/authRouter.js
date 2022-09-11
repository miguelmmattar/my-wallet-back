import express from 'express';
import * as authController from '../controllers/authController.js';
import { signUpSchema } from '../middlewares/scheemaValidationMiddlewares.js';
import { isRegistered, allowLogin } from '../middlewares/authentificationMiddlewares.js';

const router = express.Router();

router.post('/auth/sign-up', signUpSchema, isRegistered, authController.signUp);
router.post('/auth/login', allowLogin, authController.signIn);

export default router;