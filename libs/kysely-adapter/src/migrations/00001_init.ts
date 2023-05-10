import { Kysely } from 'kysely'

export const init0001 = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('auth')
      .addColumn('id', 'text', col => col.primaryKey())
      .addColumn('privateKey', 'text', col => col.notNull())
      .addColumn('publicKey', 'text', col => col.notNull())
      .addColumn('iv', 'text', col => col.notNull())
      .addColumn('passwordHash', 'text', col => col.notNull())
      .execute()
    await db.schema
      .createIndex('auth_public')
      .on('auth')
      .column('publicKey') // for reverse public key lookup
      .execute()
  },
  async down(db: Kysely<any>){
    await db.schema
      .dropTable('auth')
      .execute()
  },
}