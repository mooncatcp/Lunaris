import { Kysely, Migration, sql } from 'kysely'

export const moveAttachmentsToArray00010: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('message')
      .addColumn('attachments', sql`text[]`)
      .execute()
    await db.schema
      .dropTable('attachment')
      .execute()
  },
}
