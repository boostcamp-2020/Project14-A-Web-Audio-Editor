import { Transactional } from 'typeorm-transactional-cls-hooked';

class TransactionWrapper {
  @Transactional()
  static async transaction(cb) {
    await cb();
  }
}

export { TransactionWrapper };
