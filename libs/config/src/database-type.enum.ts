export enum DatabaseType {
  Sqlite,
  Postgres,
}

export const databaseTypeFromString = (data: string): DatabaseType => {
  if (data === 'postgres') {
    return DatabaseType.Postgres
  } else if (data === 'sqlite') {
    return DatabaseType.Sqlite
  } else {
    throw new TypeError(`unknown database type: ${data}`)
  }
}