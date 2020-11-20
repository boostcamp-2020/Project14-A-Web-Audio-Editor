import { BusinessError } from './business-error';
import { ErrorCode } from './error-code';

class EntityAlreadyExist extends BusinessError {
  constructor() {
    super(ErrorCode.ENTITY_ALREADY_EXIST);
  }
}

export { EntityAlreadyExist };
