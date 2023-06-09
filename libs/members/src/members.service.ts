import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { ErrorCode } from '@app/response/error-code.enum'
import { TokenService } from '@app/auth/token.service'
import * as crypto from 'crypto'
import { CryptoService } from '@app/crypto/crypto.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Member } from '@app/schema/guild.schema'
import { SnowflakeService } from '@app/snowflake/snowflake.service'
import { RolesService } from '@app/members/roles.service'

@Injectable()
export class MembersService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly crypto: CryptoService,
    @Inject(forwardRef(() => TokenService)) private readonly tokens: TokenService,
    private readonly events: EventEmitter2,
    private readonly snowflakes: SnowflakeService,
    @Inject(forwardRef(() => RolesService)) private readonly roles: RolesService,
  ) {}

  async setIsBot(id: string, isBot: boolean) {
    await this.enforceExists(id)
    const member = await this.db.updateTable('member')
      .where('member.id', '=', id)
      .set({ isBot })
      .returningAll()
      .executeTakeFirst()
    const roles = await this.roles.getUserRoles(id)
    this.events.emit('member.updated', { ...member, roles })

    return member!
  }

  async updateMember(id: string, username: string, avatar?: string) {
    await this.enforceExists(id)
    const member = (await this.db.updateTable('member')
      .where('member.id', '=', id)
      .set({ username, avatar })
      .returningAll()
      .executeTakeFirst())!
    const roles = await this.roles.getUserRoles(id)

    this.events.emit('member.updated', { ...member, roles })

    return { ...member, roles }
  }

  async get(id: string) {
    const member = await this.db.selectFrom('member')
      .where('member.id', '=', id)
      .selectAll()
      .executeTakeFirst()
    if (member === undefined) {
      throw new NotFoundException({ code: ErrorCode.UnknownMember })
    }

    return member
  }
  
  async createMember(
    publicKey: crypto.KeyObject, 
    username: string, 
    signId: string, 
    signedData: Buffer,
  ) {
    if (!await this.tokens.verifyAuth(signId, signedData, publicKey)) {
      throw new UnauthorizedException({ code: ErrorCode.InvalidSignature })
    }
    const exported = this.crypto.exportKey(publicKey).toString('base64')

    if ((await this.getByKey(publicKey)) !== undefined) {
      throw new ConflictException({ code: ErrorCode.PublicKeyAlreadyRegistered })
    }

    const total = await this.totalMembers()
    const member: Member = {
      id: this.snowflakes.nextStringId(),
      isOwner: total === 0,
      publicKey: exported,
      username: username,
      isBot: false,
    }
    await this.db.insertInto('member')
      .values(member)
      .execute()

    if (total === 0) {
      await this.events.emitAsync('app.init')
    }
    const roles = await this.roles.getUserRoles(member.id)
    this.events.emit('member.created', { ...member, roles })

    return { ...member, roles }
  }

  async getOwner() {
    return this.db.selectFrom('member')
      .where('isOwner', '=', true)
      .selectAll()
      .executeTakeFirst()
  }

  async getByKey(key: crypto.KeyObject) {
    const exported = this.crypto.exportKey(key)
    return this.db
      .selectFrom('member')
      .selectAll()
      .where('member.publicKey', '=', exported.toString('base64'))
      .executeTakeFirst()
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
