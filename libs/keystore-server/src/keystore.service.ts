import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { DB } from '@app/schema/db.schema'
import { Keystore } from '@app/schema/keystore.schema'
import { ErrorCode } from '@app/response/error-code.enum'
import { CryptoService } from '@app/crypto/crypto.service'

@Injectable()
export class KeystoreService {
  constructor(
    private readonly kysely: KyselyService<DB>,
    private readonly cryptoService: CryptoService,
  ) {}

  async loginExists(login: string) {
    const { countAll } = this.kysely.fn
    return this.kysely.selectFrom('keystore')
      .select(countAll().as('entries'))
      .where('keystore.login', '=', login)
      .executeTakeFirst()
      .then(i => BigInt(i?.entries ?? 0) > 0)
  }

  async addLogin(a: Keystore) {
    if (await this.loginExists(a.login)) {
      throw new ConflictException({ code: ErrorCode.LoginAlreadyTaken })
    }

    try {
      this.cryptoService.importPublicKey(Buffer.from(a.publicKey, 'base64'))
    } catch {
      throw new BadRequestException({ code: ErrorCode.InvalidKeyFormat })
    }

    return this.kysely.insertInto('keystore')
      .values(a)
      .execute()
  }

  async getByLogin(login: string) {
    return this.kysely.selectFrom('keystore')
      .selectAll()
      .where('keystore.login', '=', login)
      .executeTakeFirst()
      .then(e => e ?? null)
  }
}
