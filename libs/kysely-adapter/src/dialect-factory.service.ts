import { Injectable, Logger } from '@nestjs/common'
import { DatabaseType, MooncatConfigService } from '@app/config'
import { Dialect, SqliteDialect } from 'kysely'
import sqlite from 'better-sqlite3'

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
      // TODO: add postgres
      throw new Error('not implemented')
    } else {
      throw new TypeError(`unknown database type - ${this.config.databaseType}`)
    }
  }
}