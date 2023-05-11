import { Injectable } from '@nestjs/common'
import { Migration, MigrationProvider } from 'kysely'
import { init0001 } from './migrations/00001_init'
import { guilds00002 } from './migrations/00002_guilds'
import { addUpdatedAt00003 } from './migrations/00003_add_updated_at'
import { addFlagsAndOwner00004 } from './migrations/00004_add_flags_and_owner'

@Injectable()
export class StaticMigrationProviderService implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '0001_init': init0001,
      '0002_guilds': guilds00002,
      '0003_add_updated_at': addUpdatedAt00003,
      '0004_add_flags': addFlagsAndOwner00004,
    }
  }
}
