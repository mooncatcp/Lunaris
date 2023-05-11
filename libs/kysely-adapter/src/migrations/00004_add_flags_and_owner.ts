import { Kysely, Migration } from 'kysely'

export const addFlagsAndOwner00004: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('message')
      .addColumn('flags', 'integer', col => col.notNull().defaultTo(0))
      .addColumn('iv', 'text', col => col.notNull())
      .execute()
    await db.schema
      .alterTable('member')
      .addColumn('isOwner', 'boolean', col => col.notNull().defaultTo(false))
      .execute()
  },
}