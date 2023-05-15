import { Injectable, NotFoundException } from '@nestjs/common'
import { DB } from '@app/schema/db.schema'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { MessageFlags } from '@app/messages/message.enum'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { CryptoService } from '@app/crypto/crypto.service'
import { randomBytes } from 'node:crypto'
import { MooncatConfigService } from '@app/config/config.service'
import { ErrorCode } from '@app/response/error-code.enum'

@Injectable() 
export class MessagesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly snowflakes: SnowflakeService,
    private readonly crypto: CryptoService,
    private readonly config: MooncatConfigService,
  ) {}

  async createMessage(
    channelId: string,
    content: string,
    flags: MessageFlags,
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

    const iv = randomBytes(16)
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    // @ts-ignore убери этот тс игнор когда пушить будешь
    return await this.db
      .insertInto('message')
      .values({
        id: messageId,
        channelId,
        content: encryptedContent.toString('base64'),
        iv: iv.toString('base64'),
        flags,
        encryptionType: 'aes',
      })
      .returning('id')
      .execute()
  }

  async modifyMessage(messageId: string, content: string) {
    const message = await this.db.selectFrom('message')
      .where('message.id', '=', messageId)
      .selectAll()
      .executeTakeFirst()

    if (message === undefined) throw new NotFoundException({ ErrorCode: ErrorCode.UnknownMessage })

    const iv = Buffer.from(message.iv, 'base64')
    const encryptedContent = this.crypto.encrypt(this.config.aesKey, Buffer.from(content, 'utf-8'), iv)

    await this.db
      .updateTable('message')
      .set({ content: encryptedContent.toString('base64') })
      .where('message.id', '=', messageId)
      .execute()
  }

  async deleteMessage(messageId: string) {
    return 0 // TODO: Implement
  }
}
