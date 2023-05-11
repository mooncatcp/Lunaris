import { Injectable } from '@nestjs/common'
import { Kysely, sql } from 'kysely'
import { DB, Role } from '@app/schema'
import { has, merge } from '@app/auth'

@Injectable()
export class RolesService {
  constructor(
    private readonly db: Kysely<DB>,
  ) {}

  async canOnMember(executor: string, subject: string, permissionsRequired: number): Promise<boolean> {
    const permissions = await this.calculateGuildPermissions(executor)
    if (!has(permissions, permissionsRequired)) {
      return false
    }
    
    const [ executorH, subjectH ] = await Promise.all([
      this.highestRole(executor),
      this.highestRole(subject),
    ])

    return executorH > subjectH
  }

  // todo: create role, create everyone role

  async createEveryoneRole() {
    // ...
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