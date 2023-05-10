import { Injectable } from '@nestjs/common'
import { Migration, MigrationProvider } from 'kysely'
import { init0001 } from './migrations/00001_init'

@Injectable()
export class StaticMigrationProviderService implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      init0001,
    }
  }
}
