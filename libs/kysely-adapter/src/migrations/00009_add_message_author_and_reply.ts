import { Kysely, Migration } from 'kysely'

export const addMessageAuthorAndReply00009: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .alterTable('message')
      .addColumn('authorId', 'text', col => col.notNull().references('member.id'))
      .addColumn('replyTo', 'text', col => col.references('message.id'))
      .execute()
  },
}