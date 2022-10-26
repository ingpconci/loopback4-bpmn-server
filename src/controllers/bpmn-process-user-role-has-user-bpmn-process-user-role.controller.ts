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
  BpmnProcessUserRole,
} from '../models';
import { RoleKeys } from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleHasUserRepository} from '../repositories';

export class BpmnProcessUserRoleHasUserBpmnProcessUserRoleController {
  constructor(
    @repository(BpmnProcessUserRoleHasUserRepository)
    public bpmnProcessUserRoleHasUserRepository: BpmnProcessUserRoleHasUserRepository,
  ) { }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-role-has-users/{id}/bpmn-process-user-role', {
    responses: {
      '200': {
        description: 'BpmnProcessUserRole belonging to BpmnProcessUserRoleHasUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(BpmnProcessUserRole)},
          },
        },
      },
    },
  })
  async getBpmnProcessUserRole(
    @param.path.number('id') id: typeof BpmnProcessUserRoleHasUser.prototype.id,
  ): Promise<BpmnProcessUserRole> {
    return this.bpmnProcessUserRoleHasUserRepository.bpmnProcessUserRole(id);
  }
}
