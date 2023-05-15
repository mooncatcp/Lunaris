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

@Injectable() 
export class MessagesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
    private readonly crypto: CryptoService,
    private readonly config: MooncatConfigService,
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
    if (attachments?.length) {
      const attachmentsWithId = attachments.map(url => ({ url, id: this.snowflakes.nextStringId(), messageId }))
      await this.db
        .insertInto('attachment')
        .values(attachmentsWithId)
        .execute()
    }

    if (referenceId) await this.enforceExists(referenceId)

    const iv = randomBytes(16)
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    return await this.db
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
      })
      .returning('id')
      .execute()
  }

  async modifyMessage(messageId: string, authorId: string, content: string, attachments?: string[]) {
    const message = await this.db.selectFrom('message')
      .where('message.id', '=', messageId)
      .selectAll()
      .executeTakeFirst()

    if (!message) throw new NotFoundException({ ErrorCode: ErrorCode.UnknownMessage })
    if (message.authorId !== authorId) throw new ForbiddenException({ ErrorCode: ErrorCode.NotMessageAuthor })

    if (attachments?.length) {
      const allAttachments = await this.db
        .selectFrom('attachment')
        .where('attachment.messageId', '=', messageId)
        .selectAll()
        .execute()

      const attachmentsToDelete = allAttachments.filter(attachment => !attachments.includes(attachment.url))

      if (attachmentsToDelete.length)
        await this.db
          .deleteFrom('attachment')
          .where('attachment.id', 'in', attachmentsToDelete.map(attachment => attachment.id))
          .execute()

      const attachmentsWithId = attachments.map(url => ({ url, id: this.snowflakes.nextStringId(), messageId }))
      await this.db
        .insertInto('attachment')
        .values(attachmentsWithId)
        .execute()
    }

    const iv = Buffer.from(message.iv, 'base64')
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    await this.db
      .updateTable('message')
      .set({ content: encryptedContent.toString('base64') })
      .where('message.id', '=', messageId)
      .execute()
  }

  async deleteMessage(messageId: string) {
    await this.db
      .deleteFrom('message')
      .where('message.id', '=', messageId)
      .execute()
  }
}
