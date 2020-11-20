import { BusinessError } from './business-error';
import { ErrorCode } from './error-code';

class EntityNotFoundError extends BusinessError {
  constructor() {
    super(ErrorCode.ENTITY_NOT_FOUND);
  }
}

export { EntityNotFoundError };
