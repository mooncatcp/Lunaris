import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Authorizer } from './authorizer'
import { MembersService } from '@app/members/members.service'
import { RolesService } from '@app/members/roles.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => MembersService)) private readonly members: MembersService,
    @Inject(forwardRef(() => RolesService)) private readonly roles: RolesService,
  ) {
  }
  
  forUser(user: string): Authorizer {
    return new Authorizer(this.members, this.roles, user)
  }

  createToken() {}
}
