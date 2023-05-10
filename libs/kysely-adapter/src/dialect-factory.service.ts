import { Injectable, Logger } from '@nestjs/common'
import { DatabaseType, MooncatConfigService } from '@app/config'
import { Dialect, PostgresDialect, SqliteDialect } from 'kysely'
import sqlite from 'better-sqlite3'
import { Pool, PoolConfig } from 'pg'
import { parse } from 'pg-connection-string'
import Cursor from 'pg-cursor'

@Injectable()
export class DialectFactoryService {
  private readonly logger = new Logger(DialectFactoryService.name)

  constructor(private readonly config: MooncatConfigService) {}
  
  getDialect(): Dialect {
    if (this.config.databaseType === DatabaseType.Sqlite) {
      return new SqliteDialect({
        database: sqlite(this.config.dsn, {}),
        onCreateConnection: async () => {
          this.logger.log('connection to the database has been established')
        },
      })
    } else if (this.config.databaseType === DatabaseType.Postgres) {
      const data = parse(this.config.dsn) as PoolConfig
      return new PostgresDialect({
        onCreateConnection: async () => {
          this.logger.log('connection to the database has been established')
        },
        pool: new Pool({
          ...data,
        }),
        cursor: Cursor,
      })
    } else {
      throw new TypeError(`unknown database type - ${this.config.databaseType}`)
    }
  }
}