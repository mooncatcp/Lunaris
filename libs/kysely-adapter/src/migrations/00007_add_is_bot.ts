import { Kysely, Migration } from 'kysely'

export const addIsBot00007: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('member')
      .addColumn('isBot', 'boolean', col => col.notNull().defaultTo(false))
      .execute()
  },
}