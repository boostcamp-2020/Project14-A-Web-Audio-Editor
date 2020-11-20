const DatabaseType = {
  MYSQL: 'mysql',
  SQLITE3: 'sqlite',
  valueOf: (typeString) => Object.keys(DatabaseType)
    .filter((value) => DatabaseType[value] === typeString)
    .reduce((value) => value, null),
  values: () => Object.values(DatabaseType).filter((value) => typeof value === 'string'),
  contains: (db) => DatabaseType.values().filter((value) => value === db).length !== 0
};

export { DatabaseType };
