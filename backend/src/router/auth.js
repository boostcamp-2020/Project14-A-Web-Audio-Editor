import express from 'express';
import { userController } from '../controller';
import { RequestType } from '../common/middleware/request-type';
import { SignupRequestBody } from '../dto';
import { transformer, validator } from '../common/middleware';

const authRouter = express.Router();

authRouter.post('/signup', transformer([RequestType.BODY], [SignupRequestBody]), validator([RequestType.BODY]), userController.signup);

export { authRouter };
