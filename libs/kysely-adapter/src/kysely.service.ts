import { Injectable, Logger } from '@nestjs/common'
import { Kysely, LogEvent, QueryLogEvent } from "kysely";
import { DialectFactoryService } from './dialect-factory.service'
import { KyselyModule } from './kysely.module'

@Injectable()
export class KyselyService<T> extends Kysely<T>  {
  private readonly logger = new Logger(KyselyService.name)

  constructor(dialectFactory: DialectFactoryService) {
    super({
      dialect: dialectFactory.getDialect(),
      log: (event: LogEvent) => {
        if (event.level === 'query') {
          event = event as QueryLogEvent
          this.logger.verbose(`query ${event.query.sql} took ${event.queryDurationMillis}ms to execute`)
        } else if (event.level === 'error') {
          this.logger.error(`query ${event.query.sql} returned an error ${event.error}`)
        }
      },
    })
  }
}
