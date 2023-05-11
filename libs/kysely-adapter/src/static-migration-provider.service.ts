import { Injectable } from '@nestjs/common'
import { Migration, MigrationProvider } from 'kysely'
import { init0001 } from './migrations/00001_init'
import { guilds00002 } from './migrations/00002_guilds'

@Injectable()
export class StaticMigrationProviderService implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '0001_init': init0001,
      '0002_guilds': guilds00002,
    }
  }
}
