import { Kysely, Migration, sql } from 'kysely'

export const guilds00002: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable('guild')
      .addColumn('name', 'text', c => c.notNull())
      .addColumn('description', 'text')
      .addColumn('iconURL', 'text')
      .addColumn('bannerURL', 'text')
      .execute()

    await db.schema
      .createTable('role')
      .addColumn('id', 'text', c => c.notNull().primaryKey())
      .addColumn('name', 'text', c => c.notNull())
      .addColumn('color', 'integer', c => c.notNull().defaultTo(0xffffff))
      .addColumn('permissions', 'integer', c => c.notNull().defaultTo(0))
      .addColumn('position', 'integer', c => c.notNull())
      .execute()

    await db.schema
      .createTable('member')
      .addColumn('id', 'text', c => c.notNull().primaryKey())
      .addColumn('publicKey', 'text', c => c.notNull())
      .addColumn('username', 'text', c => c.notNull())
      .addColumn('avatar', 'text')
      .execute()

    await db.schema
      .createTable('roleMember')
      .addColumn('memberId', 'text', c => c.notNull().references('member.id').onDelete('cascade'))
      .addColumn('roleId', 'text', c => c.notNull().references('role.id').onDelete('cascade'))
      .execute()

    await db.schema
      .createTable('channel')
      .addColumn('id', 'text', c => c.primaryKey().notNull())
      .addColumn('type', 'text', c => c.notNull())
      .addColumn('name', 'text', c => c.notNull())
      .addColumn('parentId', 'text', c => c.references('channel.id').onDelete('set null'))
      .addColumn('description', 'text')
      .execute()

    await db.schema
      .createTable('message')
      .addColumn('id', 'text', c => c.primaryKey().notNull())
      .addColumn('channelId', 'text', c =>
        c.notNull().references('channel.id').onDelete('cascade'))
      .addColumn('content', 'text', c => c.notNull())
      .execute()

    await db.schema
      .createTable('attachment')
      .addColumn('id', 'text', c => c.primaryKey().notNull())
      .addColumn('messageId', 'text', c => c.notNull().references('message.id').onDelete('cascade'))
      .addColumn('url', 'text', c => c.notNull())
      .execute()

    await db.schema
      .createTable('permissionOverwrite')
      .addColumn('id', 'text', c => c.primaryKey().notNull())
      .addColumn('type', 'text', c => c.notNull())
      .addColumn('permissions', 'integer', c => c.notNull().defaultTo(0))
      .addColumn('roleId', 'text', c => c.references('role.id').onDelete('cascade'))
      .addColumn('memberId', 'text', c => c.references('member.id').onDelete('cascade'))
      .addColumn('channelId', 'text', c => c.references('channel.id').onDelete('cascade'))
      .execute()
  },
}