import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Kysely, LogEvent, Migrator, QueryLogEvent } from 'kysely'
import { DialectFactoryService } from './dialect-factory.service'
import { StaticMigrationProviderService } from './static-migration-provider.service'
import { MooncatConfigService } from '@app/config'

@Injectable()
export class KyselyService<T> extends Kysely<T> implements OnModuleInit {
  private readonly logger = new Logger(KyselyService.name)

  constructor(
    private readonly migrationProvider: StaticMigrationProviderService,
    private readonly config: MooncatConfigService,
    dialectFactory: DialectFactoryService,
  ) {
    super({
      dialect: dialectFactory.getDialect(),
      log: (event: LogEvent) => {
        if (!this.config.debug) return
        if (event.level === 'query') {
          event = event as QueryLogEvent
          this.logger.verbose(`Query \`${event.query.sql}\` took ${event.queryDurationMillis}ms to execute`)
        } else if (event.level === 'error') {
          this.logger.error(`Query \`${event.query.sql}\` returned an error ${event.error}`)
        }
      },
    })
  }

  async onModuleInit() {
    const migrator = new Migrator({
      db: this as KyselyService<any>,
      provider: this.migrationProvider,
    })

    const { error, results } = await migrator.migrateToLatest()

    results?.forEach(result => {
      if (result.status === 'Success') {
        this.logger.log(`Migration ${result.migrationName} executed(${result.direction})`)
      } else if (result.status === 'Error') {
        this.logger.error(`Migration ${result.migrationName} failed to execute(${result.direction})`)
      }
    })

    if (error) {
      this.logger.error('Failed to migrate')
      if (error instanceof Error) {
        this.logger.error(error.stack)
      } else {
        this.logger.error(error)
      }
      process.exit(1)
    }
  }
}
