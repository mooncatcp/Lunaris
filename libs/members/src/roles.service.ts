import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Role } from '@app/schema/guild.schema'
import { DB } from '@app/schema/db.schema'
import { ALL, DEFAULT_GUILD_PERMISSIONS, has, merge } from '@app/permissions/permissions.enum'
import { KyselyService } from '@app/kysely-adapter/kysely.service'
import { MembersService } from '@app/members/members.service'
import { ErrorCode } from '@app/response/error-code.enum'
import { OnEvent } from '@nestjs/event-emitter'
import { SnowflakeService } from '@app/snowflake/snowflake.service'

@Injectable()
export class RolesService {
  constructor(
    private readonly db: KyselyService<DB>,
    private readonly members: MembersService,
    private readonly snowflake: SnowflakeService,
  ) {}

  async getUserRoles(member: string) {
    await this.members.enforceExists(member)
    return this.db
      .selectFrom('roleMember')
      .where('roleMember.memberId', '=', member)
      .select([
        'roleMember.roleId',
      ])
      .execute()
      .then(e =>
        e.filter(v => v !== null).map(e => e.roleId as string),
      )
  }

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

  async canUpdateRolePositions(editorsHighestRole: number, positions: ({ id: string; position: number })[]) {
    const pos = new Set<string>()
    positions.forEach(c => {
      if (pos.has(c.id)) {
        throw new BadRequestException({ code: ErrorCode.SamePositionRoles })
      } else {
        pos.add(c.id)
      }
    })
    const asMap = new Map(positions.map(({ id, position }) => [ id, position ]))

    if (editorsHighestRole !== -1) {
      const currentPositions = await this.db.selectFrom('role')
        .select([ 'role.position', 'role.id' ])
        .execute()

      for (const curPos of currentPositions) {
        if (curPos.position >= editorsHighestRole && curPos.position !== asMap.get(curPos.id)) {
          throw new BadRequestException({ code: ErrorCode.CantMoveRole })
        }
      }
    }
  }

  async updateRolePositions(positions: ({ id: string; position: number })[], editorsHighestRole = -1) {
    await this.canUpdateRolePositions(editorsHighestRole, positions)

    for (const role of positions) {
      await this.enforceExists(role.id)
      await this.db.updateTable('role')
        .where('id', '=', role.id)
        .set({
          position: role.position,
        })
        .execute()
    }
  }

  async updateRole(id: string, name: string, color: number, permissions: number) {
    await this.enforceExists(id)
    return this.db.updateTable('role')
      .where('id', '=', id)
      .set({ name, color, permissions })
      .execute()
  }

  async createRole(name: string, idOverride?: string) {
    const id = idOverride ?? this.snowflake.nextStringId()

    await this.db.updateTable('role')
      .set(({ bxp }) => ({
        position: bxp('position', '+', 1),
      }))
      .execute()
    await this.db.insertInto('role')
      .values({
        id,
        name,
        color: 0xffffff,
        permissions: DEFAULT_GUILD_PERMISSIONS,
        position: 0,
      })
      .execute()
    
    return
  }

  // todo: create role, create everyone role

  @OnEvent('app.init')
  async createEveryoneRole() {
    const owner = await this.members.getOwner()
    await this.createRole('everyone', owner!.id)
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