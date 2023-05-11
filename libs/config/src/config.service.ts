import { Injectable, Logger } from '@nestjs/common'
import { DatabaseType, databaseTypeFromString } from './database-type.enum'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { CryptoService } from '@app/crypto'

@Injectable()
export class MooncatConfigService {
  private readonly logger = new Logger(MooncatConfigService.name)
  databaseType: DatabaseType
  dsn: string
  debug: boolean
  appPort: number
  aesKey: crypto.KeyObject

  constructor(config: ConfigService, cryptoService: CryptoService) {
    this.aesKey = cryptoService.importSecretKey(
      Buffer.from(config.getOrThrow<string>('AES_KEY'), 'base64'),
    )
    this.debug = config.get<string>('DEBUG') === 'true'
    this.databaseType = databaseTypeFromString(config.getOrThrow('DB_TYPE'))
    const port = +(config.get<string>('APP_PORT') ?? 3000)
    if (isNaN(port)) {
      this.logger.error(`Invalid APP_PORT: ${port}`)
      process.exit(1)
    } else {
      this.appPort = port
    }

    if (this.databaseType === DatabaseType.Sqlite) {
      this.logger.error('Sqlite is not supported.')
      process.exit(1)
    }

    this.dsn = config.getOrThrow('DB_DSN')
  }
}