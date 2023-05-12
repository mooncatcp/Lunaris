import { Injectable, Logger } from '@nestjs/common'
import { DatabaseType } from '@app/config/database-type.enum'
import { MooncatConfigService } from '@app/config/config.service'
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
          this.logger.log('Connection to the database has been established')
        },
      })
    } else if (this.config.databaseType === DatabaseType.Postgres) {
      const data = parse(this.config.dsn) as PoolConfig
      return new PostgresDialect({
        onCreateConnection: async () => {
          this.logger.log('Connection to the database has been established')
        },
        pool: new Pool({
          ...data,
        }),
        cursor: Cursor,
      })
    } else {
      this.logger.error(`Unknown database type - ${this.config.databaseType}`)
      process.exit(1)
    }
  }
}