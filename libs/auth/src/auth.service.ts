import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter'
import { Auth, DB } from '@app/schema'
import { ErrorCode } from '@app/response'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private readonly kysely: KyselyService<DB>,
  ) {}

  async loginExists(login: string) {
    const { countAll } = this.kysely.fn
    return this.kysely.selectFrom('auth')
      .select(countAll().as('entries'))
      .where('auth.login', '=', login)
      .executeTakeFirst()
      .then(i => BigInt(i?.entries ?? 0) > 0)
  }

  async addLogin(a: Auth) {
    if (await this.loginExists(a.login)) {
      throw new ConflictException({ code: ErrorCode.LoginAlreadyTaken })
    }

    try {
      crypto.createPublicKey(a.publicKey)
    } catch {
      throw new BadRequestException({ code: ErrorCode.InvalidKeyFormat })
    }

    return this.kysely.insertInto('auth')
      .values(a)
      .execute()
  }

  async getByLogin(login: string) {
    return this.kysely.selectFrom('auth')
      .selectAll()
      .where('auth.login', '=', login)
      .executeTakeFirst()
      .then(e => e ?? null)
  }
}
