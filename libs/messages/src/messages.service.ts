import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { DB } from '@app/schema/db.schema'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { MessageFlags } from '@app/messages/message.enum'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { CryptoService } from '@app/crypto/crypto.service'
import { randomBytes } from 'node:crypto'
import { MooncatConfigService } from '@app/config/config.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { sql } from 'kysely'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable() 
export class MessagesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
    private readonly crypto: CryptoService,
    private readonly config: MooncatConfigService,
    private readonly events: EventEmitter2,
  ) {}

  async exists(messageId: string) {
    return Boolean(await this.db.selectFrom('message')
      .where('message.id', '=', messageId)
      .execute())
  }

  async enforceExists(messageId: string) {
    if (!await this.exists(messageId)) throw new NotFoundException({ code: ErrorCode.UnknownMessage })
  }

  async getMessage(messageId: string) {
    const message = await this.db
      .selectFrom('message')
      .where('message.id', '=', messageId)
      .selectAll()
      .executeTakeFirst()

    if (message === undefined) throw new NotFoundException({ code: ErrorCode.UnknownMessage })

    return message
  }

  async getMessages(limit: number, before?: string, after?: string) {
    if (limit > 100) throw new BadRequestException({ code: ErrorCode.TooManyMessages })

    let messagesSqlRequest = this.db.selectFrom('message')
      .selectAll()
      .orderBy('message.id', 'desc')

    if (before) messagesSqlRequest = messagesSqlRequest.where(sql`CAST(message.id AS decimal)`, '<', before)
    if (after) messagesSqlRequest = messagesSqlRequest.where(sql`CAST(message.id AS decimal)`, '>', after)

    const messages = await messagesSqlRequest.limit(limit).execute() ?? []

    return await Promise.all(messages.map(async message => {
      const decryptedContent = this.crypto.decrypt(
        this.config.aesKey,
        Buffer.from(message.content, 'base64'),
        Buffer.from(message.iv, 'base64'),
      )
      return { ...message, content: decryptedContent.toString('utf-8'), iv: undefined, encryptionType: undefined }
    }))
  }

  async createMessage(
    channelId: string,
    content: string,
    flags: MessageFlags,
    authorId: string,
    attachments?: string[],
    referenceId?: string,
  ) {
    const messageId = this.snowflakes.nextStringId()

    if (referenceId) await this.enforceExists(referenceId)

    const iv = randomBytes(16)
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    const msg = await this.db
      .insertInto('message')
      .values({
        id: messageId,
        channelId,
        content: encryptedContent.toString('base64'),
        iv: iv.toString('base64'),
        flags,
        authorId,
        encryptionType: 'aes',
        replyTo: referenceId,
        attachments: attachments ?? [],
      })
      .returningAll()
      .executeTakeFirst()

    const data = { ...(msg!), content }
    this.events.emit('message.created', data)

    return data
  }

  async modifyMessage(messageId: string, authorId: string, content: string, attachments: string[] = []) {
    const message = await this.db.selectFrom('message')
      .where('message.id', '=', messageId)
      .selectAll()
      .executeTakeFirst()

    if (!message) throw new NotFoundException({ ErrorCode: ErrorCode.UnknownMessage })
    if (message.authorId !== authorId) throw new ForbiddenException({ ErrorCode: ErrorCode.NotMessageAuthor })

    const iv = Buffer.from(message.iv, 'base64')
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    const result = await this.db
      .updateTable('message')
      .set({ content: encryptedContent.toString('base64'), attachments })
      .where('message.id', '=', messageId)
      .returningAll()
      .executeTakeFirst()
    const r = { ...(result!), content }

    this.events.emit('message.updated', r)

    return r
  }

  async deleteMessage(messageId: string) {
    await this.db
      .deleteFrom('message')
      .where('message.id', '=', messageId)
      .execute()
    this.events.emit('message.deleted', { id: messageId })
  }
}
