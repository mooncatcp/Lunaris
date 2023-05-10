import { Kysely } from 'kysely'

export const init0001 = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('keystore')
      .addColumn('login', 'text', col => col.primaryKey())
      .addColumn('privateKey', 'text', col => col.notNull())
      .addColumn('publicKey', 'text', col => col.notNull())
      .addColumn('iv', 'text', col => col.notNull())
      .addColumn('passwordHash', 'text', col => col.notNull())
      .execute()
    await db.schema
      .createIndex('keystore_public')
      .on('keystore')
      .column('publicKey') // for reverse public key lookup
      .execute()
  },
  async down(db: Kysely<any>){
    await db.schema
      .dropTable('keystore')
      .execute()
  },
}