import { Injectable } from '@nestjs/common'
import { Migration, MigrationProvider } from 'kysely'
// eslint-disable no-restricted-imports
import { init0001 } from '@app/kysely-adapter/migrations/00001_init'
import { guilds00002 } from '@app/kysely-adapter/migrations/00002_guilds'
import { addUpdatedAt00003 } from '@app/kysely-adapter/migrations/00003_add_updated_at'
import { addFlagsAndOwner00004 } from '@app/kysely-adapter/migrations/00004_add_flags_and_owner'
import { addEncryptionType00005 } from '@app/kysely-adapter/migrations/00005_add_encryption_type_to_message'
import { makePublicKeyUnique00006 } from '@app/kysely-adapter/migrations/00006_make_public_key_unique'
import { addIsBot00007 } from '@app/kysely-adapter/migrations/00007_add_is_bot'

@Injectable()
export class StaticMigrationProviderService implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '00001_init': init0001,
      '00002_guilds': guilds00002,
      '00003_add_updated_at': addUpdatedAt00003,
      '00004_add_flags': addFlagsAndOwner00004,
      '00005_add_encryption_type': addEncryptionType00005,
      '00006_make_public_key_unique': makePublicKeyUnique00006,
      '00007_add_is_bot': addIsBot00007,
    }
  }
}
