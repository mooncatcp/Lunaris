import { Kysely, Migration, sql } from 'kysely'

export const addSync00011: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .alterTable('keystore')
      .addColumn('username', 'text')
      .addColumn('avatar', 'text')
      .addColumn('joinedServers', sql`text[]`, col => col.notNull().defaultTo(sql`'{}'`))
      .execute()
  },
}
