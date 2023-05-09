import { Injectable } from '@nestjs/common'
import { DatabaseType, databaseTypeFromString } from './database-type.enum'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MooncatConfigService {
  databaseType: DatabaseType
  dsn: string

  constructor(config: ConfigService) {
    this.databaseType = databaseTypeFromString(config.getOrThrow('DB_TYPE'))
    this.dsn = config.getOrThrow('DB_DSN')
  }
}