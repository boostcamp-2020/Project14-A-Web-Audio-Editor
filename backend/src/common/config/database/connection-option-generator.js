import path from 'path';
import { DatabaseType } from './database-type';

class ConnectionOptionGenerator {
  static SQLITE3_DATABASE = ':memory:';

  constructor(databaseEnv) {
    this.databaseEnv = databaseEnv;
  }

  generateConnectionOption() {
    const connectionOption = {
      type: this.databaseEnv.getDatabaseType(),
      entities: [path.resolve(`${__dirname}/../../../model/*.js`)],
      logging: this.databaseEnv.getDatabaseLogging(),
      dropSchema: this.databaseEnv.getDatabaseDropSchema(),
      synchronize: this.databaseEnv.getDatabaseSynchronize(),
      extra: {}
    };

    switch (this.databaseEnv.getDatabaseType()) {
      case DatabaseType.MYSQL:
        connectionOption.url = this.databaseEnv.getDatabaseUrl();
        connectionOption.connectTimeout = 3000;
        connectionOption.acquireTimeout = 5000;
        connectionOption.extra.connectionLimit = this.databaseEnv.getDatabaseConnectionLimit();
        break;
      case DatabaseType.SQLITE3:
        connectionOption.database = ConnectionOptionGenerator.SQLITE3_DATABASE;
        break;
      default:
    }

    return connectionOption;
  }
}

export { ConnectionOptionGenerator };
