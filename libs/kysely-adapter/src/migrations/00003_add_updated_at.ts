import { Kysely, Migration } from 'kysely'

export const addUpdatedAt00003: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('message')
      .addColumn('lastUpdatedAt', 'timestamp')
      .execute()
  },
}