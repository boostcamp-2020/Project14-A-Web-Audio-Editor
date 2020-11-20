import express from 'express';
import { userController } from '../controller';

const apiRouter = express.Router();

apiRouter.get('/users', userController.sendUsers);

export { apiRouter };
