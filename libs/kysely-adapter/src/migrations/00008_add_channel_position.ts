import { Kysely, Migration } from 'kysely'

export const addChannelPosition00008: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('channel')
      .addColumn('position', 'integer', col => col.notNull())
      .execute()
  },
}