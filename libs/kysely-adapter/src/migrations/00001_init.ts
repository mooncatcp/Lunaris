import { Kysely } from 'kysely'

export const init0001 = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('auth')
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('privateKey', 'text', col => col.notNull())
      .addColumn('publicKey', 'text', col => col.notNull())
      .addColumn('iv', 'text', col => col.notNull())
      .addColumn('passwordHash', 'text', col => col.notNull())
      .execute()
  },
  async down(db: Kysely<any>){
    await db.schema
      .dropTable('auth')
      .execute()
  },
}