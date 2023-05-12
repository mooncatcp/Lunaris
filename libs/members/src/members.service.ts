import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { ErrorCode } from '@app/response/error-code.enum'
import { TokenService } from '@app/auth/token.service'
import * as crypto from 'crypto'
import { CryptoService } from '@app/crypto/crypto.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Member } from '@app/schema/guild.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'


@Injectable()
export class MembersService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly crypto: CryptoService,
    @Inject(forwardRef(() => TokenService)) private readonly tokens: TokenService,
    private readonly emitter: EventEmitter2,
    private readonly snowflakes: SnowflakeService,
  ) {}
  
  async createUser(
    publicKey: crypto.KeyObject, 
    username: string, 
    signId: string, 
    signedData: Buffer,
  ) {
    if (!this.tokens.verifyAuth(signId, signedData, publicKey)) {
      throw new UnauthorizedException({ code: ErrorCode.InvalidSignature })
    }
    const exported = this.crypto.exportKey(publicKey).toString('base64')
    const total = await this.totalMembers()
    const member: Member = {
      id: this.snowflakes.nextStringId(),
      isOwner: total === 0,
      publicKey: exported,
      username: username,
    }
    await this.db.insertInto('member')
      .values(member)
      .execute()

    return member.id
  }

  async totalMembers() {
    return this.db
      .selectFrom('member')
      .select(this.db.fn.countAll().as('total'))
      .executeTakeFirst()
      .then(e => Number(e?.total) ?? 0)
  }

  async exists(member: string) {
    const { countAll } = this.db.fn
    const res = await this.db
      .selectFrom('member')
      .where('member.id', '=', member)
      .select(countAll().as('with_id'))
      .executeTakeFirst()
    return res !== undefined && BigInt(res.with_id) !== 0n
  }
  
  async enforceExists(member: string) {
    if (!await this.exists(member)) {
      throw new NotFoundException({ code: ErrorCode.UnknownMember })
    }
  }
  
  async isOwner(member: string) {
    await this.enforceExists(member)
    return this.db.selectFrom('member')
      .where('member.id', '=', member)
      .select('member.isOwner')
      .executeTakeFirst()
      .then(e => e?.isOwner ?? false)
  }
}
