import { authorize } from '@loopback/authorization';
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  BpmnProcessUserRoleHasUser,
  User,
} from '../models';
import { RoleKeys } from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleHasUserRepository} from '../repositories';

export class BpmnProcessUserRoleHasUserUserController {
  constructor(
    @repository(BpmnProcessUserRoleHasUserRepository)
    public bpmnProcessUserRoleHasUserRepository: BpmnProcessUserRoleHasUserRepository,
  ) { }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-role-has-users/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to BpmnProcessUserRoleHasUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof BpmnProcessUserRoleHasUser.prototype.id,
  ): Promise<User> {
    return this.bpmnProcessUserRoleHasUserRepository.user(id);
  }
}
