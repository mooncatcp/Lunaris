import { Injectable, Logger } from '@nestjs/common'
import { DatabaseType, databaseTypeFromString } from './database-type.enum'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MooncatConfigService {
  private readonly logger = new Logger(MooncatConfigService.name)
  databaseType: DatabaseType
  dsn: string
  logQueries: boolean

  constructor(config: ConfigService) {
    this.logQueries = config.get<string>('LOG_QUERIES') === 'true'
    this.databaseType = databaseTypeFromString(config.getOrThrow('DB_TYPE'))

    if (this.databaseType === DatabaseType.Sqlite) {
      this.logger.error('Sqlite is not supported.')
      process.exit(1)
    }

    this.dsn = config.getOrThrow('DB_DSN')
  }
}