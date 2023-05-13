import { Injectable, NotFoundException } from '@nestjs/common'
import { Role } from '@app/schema/guild.schema'
import { DB } from '@app/schema/db.schema'
import { ALL, has, merge } from '@app/permissions/permissions.enum'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { MembersService } from '@app/members/members.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class RolesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly members: MembersService,
  ) {}

  async canOnMember(executor: string, subject: string, permissionsRequired: number): Promise<boolean> {
    if (await this.members.isOwner(executor)) return true
    const permissions = await this.calculateGuildPermissions(executor)
    if (!has(permissions, permissionsRequired)) {
      return false
    }
    
    const [ executorH, subjectH ] = await Promise.all([
      this.highestRole(executor).then(e => e.position!),
      this.highestRole(subject).then(e => e.position!),
    ])

    return executorH > subjectH
  }

  async exists(role: string) {
    const { countAll } = this.db.fn
    const res = await this.db
      .selectFrom('role')
      .where('role.id', '=', role)
      .select(countAll().as('with_id'))
      .executeTakeFirst()
    return res !== undefined && BigInt(res.with_id) !== 0n
  }

  async enforceExists(role: string) {
    if (!await this.exists(role)) {
      throw new NotFoundException({ code: ErrorCode.UnknownRole })
    }
  }

  // todo: create role, create everyone role

  @OnEvent('app.init')
  async createEveryoneRole() {
    console.log('creating everyone role')
  }

  async getEveryoneRole(): Promise<Role> {
    const everyone = await this.db
      .selectFrom('member')
      .where('member.isOwner', '=', true)
      .leftJoin('role', col => col.onRef('role.id', '=', 'member.id'))
      .select([
        'role.id',
        'role.permissions',
        'role.position',
        'role.color',
        'role.name',
      ])
      .executeTakeFirst()
    if (everyone === undefined) {
      await this.createEveryoneRole()
      return this.getEveryoneRole()
    }

    return everyone as unknown as Role
  }

  async highestRole(member: string) {
    await this.members.enforceExists(member)
    const notEveryone = await this.db
      .selectFrom('roleMember')
      .where('roleMember.memberId', '=', member)
      .leftJoin('role', col => col.onRef('role.id', '=', 'roleMember.roleId'))
      .selectAll()
      .orderBy('role.position', 'desc')
      .executeTakeFirst()
    return notEveryone ?? await this.getEveryoneRole()
  }

  async calculateGuildPermissions(member: string) {
    if (await this.members.isOwner(member)) {
      return ALL
    }
    const permissions = await this.db
      .selectFrom('roleMember')
      .where('roleMember.memberId', '=', member)
      .leftJoin('role', col => col.onRef('role.id', '=', 'roleMember.roleId'))
      .select('role.permissions')
      .execute()
    return permissions
      .map(e => e.permissions ?? 0)
      .reduce((prev, cur) => merge(prev, cur), 0)
  }
}