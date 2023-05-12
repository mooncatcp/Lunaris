import { Kysely, Migration } from 'kysely'

export const addEncryptionType00005: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('message')
      .addColumn('encryptionType', 'text', col => col.notNull())
      .execute()
  },
}