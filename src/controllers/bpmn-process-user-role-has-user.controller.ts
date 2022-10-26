import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {BpmnProcessUserRoleHasUser} from '../models';
import { RoleKeys } from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleHasUserRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessUserRoleHasUserController {
  constructor(
    @repository(BpmnProcessUserRoleHasUserRepository)
    public bpmnProcessUserRoleHasUserRepository : BpmnProcessUserRoleHasUserRepository,
  ) {}

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-user-role-has-users')
  @response(200, {
    description: 'BpmnProcessUserRoleHasUser model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserRoleHasUser)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasUser, {
            title: 'NewBpmnProcessUserRoleHasUser',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessUserRoleHasUser: Omit<BpmnProcessUserRoleHasUser, 'id'>,
  ): Promise<BpmnProcessUserRoleHasUser> {
    return this.bpmnProcessUserRoleHasUserRepository.create(bpmnProcessUserRoleHasUser);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR,RoleKeys.OPERATOR]
  })
  @get('/bpmn-process-user-role-has-users/count')
  @response(200, {
    description: 'BpmnProcessUserRoleHasUser model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessUserRoleHasUser) where?: Where<BpmnProcessUserRoleHasUser>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleHasUserRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR,RoleKeys.OPERATOR]
  })
  @get('/bpmn-process-user-role-has-users')
  @response(200, {
    description: 'Array of BpmnProcessUserRoleHasUser model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessUserRoleHasUser, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessUserRoleHasUser) filter?: Filter<BpmnProcessUserRoleHasUser>,
  ): Promise<BpmnProcessUserRoleHasUser[]> {
    return this.bpmnProcessUserRoleHasUserRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-role-has-users')
  @response(200, {
    description: 'BpmnProcessUserRoleHasUser PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasUser, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleHasUser: BpmnProcessUserRoleHasUser,
    @param.where(BpmnProcessUserRoleHasUser) where?: Where<BpmnProcessUserRoleHasUser>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleHasUserRepository.updateAll(bpmnProcessUserRoleHasUser, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-role-has-users/{id}')
  @response(200, {
    description: 'BpmnProcessUserRoleHasUser model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessUserRoleHasUser, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BpmnProcessUserRoleHasUser, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessUserRoleHasUser>
  ): Promise<BpmnProcessUserRoleHasUser> {
    return this.bpmnProcessUserRoleHasUserRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-role-has-users/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasUser PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasUser, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleHasUser: BpmnProcessUserRoleHasUser,
  ): Promise<void> {
    await this.bpmnProcessUserRoleHasUserRepository.updateById(id, bpmnProcessUserRoleHasUser);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-user-role-has-users/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasUser PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bpmnProcessUserRoleHasUser: BpmnProcessUserRoleHasUser,
  ): Promise<void> {
    await this.bpmnProcessUserRoleHasUserRepository.replaceById(id, bpmnProcessUserRoleHasUser);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-user-role-has-users/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasUser DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bpmnProcessUserRoleHasUserRepository.deleteById(id);
  }
}
