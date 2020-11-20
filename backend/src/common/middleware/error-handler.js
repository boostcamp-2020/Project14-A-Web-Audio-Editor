import { ValidationError } from 'class-validator';
import { BusinessError } from '../error/business-error';
import { ErrorCode } from '../error/error-code';

const errorHandler = (err, req, res, next) => {
  if (err instanceof BusinessError) {
    res.status(err.errorCode.httpStatusCode).json({
      error: {
        code: err.errorCode.code,
        message: err.errorCode.message
      }
    });
  } else if (Array.isArray(err) && err[0] instanceof ValidationError) {
    res.status(ErrorCode.VALIDATION_ERROR.httpStatusCode).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR.code,
        message: ErrorCode.VALIDATION_ERROR.message
      }
    });
  } else {
    throw err;
  }
};

export default errorHandler;
