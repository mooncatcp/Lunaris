import { Kysely, Migration } from 'kysely'

export const makePublicKeyUnique00006: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('member')
      .addUniqueConstraint('member_publicKey_unique', [ 'publicKey' ])
      .execute()
  },
}