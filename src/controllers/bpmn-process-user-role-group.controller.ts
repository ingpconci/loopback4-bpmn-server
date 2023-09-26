import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {BpmnProcessUserRoleGroup} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleGroupRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessUserRoleGroupController {
  constructor(
    @repository(BpmnProcessUserRoleGroupRepository)
    public bpmnProcessUserRoleGroupRepository: BpmnProcessUserRoleGroupRepository,
  ) { }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-user-role-groups')
  @response(200, {
    description: 'BpmnProcessUserRoleGroup model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserRoleGroup)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleGroup, {
            title: 'NewBpmnProcessUserRoleGroup',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessUserRoleGroup: Omit<BpmnProcessUserRoleGroup, 'id'>,
  ): Promise<BpmnProcessUserRoleGroup> {
    return this.bpmnProcessUserRoleGroupRepository.create(bpmnProcessUserRoleGroup);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-user-role-groups/count')
  @response(200, {
    description: 'BpmnProcessUserRoleGroup model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessUserRoleGroup) where?: Where<BpmnProcessUserRoleGroup>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleGroupRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-user-role-groups')
  @response(200, {
    description: 'Array of BpmnProcessUserRoleGroup model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessUserRoleGroup, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessUserRoleGroup) filter?: Filter<BpmnProcessUserRoleGroup>,
  ): Promise<BpmnProcessUserRoleGroup[]> {
    return this.bpmnProcessUserRoleGroupRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-role-groups')
  @response(200, {
    description: 'BpmnProcessUserRoleGroup PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleGroup, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleGroup: BpmnProcessUserRoleGroup,
    @param.where(BpmnProcessUserRoleGroup) where?: Where<BpmnProcessUserRoleGroup>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleGroupRepository.updateAll(bpmnProcessUserRoleGroup, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-user-role-groups/{id}')
  @response(200, {
    description: 'BpmnProcessUserRoleGroup model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessUserRoleGroup, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BpmnProcessUserRoleGroup, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessUserRoleGroup>
  ): Promise<BpmnProcessUserRoleGroup> {
    return this.bpmnProcessUserRoleGroupRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-role-groups/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleGroup PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleGroup, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleGroup: BpmnProcessUserRoleGroup,
  ): Promise<void> {
    await this.bpmnProcessUserRoleGroupRepository.updateById(id, bpmnProcessUserRoleGroup);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-user-role-groups/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleGroup PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bpmnProcessUserRoleGroup: BpmnProcessUserRoleGroup,
  ): Promise<void> {
    await this.bpmnProcessUserRoleGroupRepository.replaceById(id, bpmnProcessUserRoleGroup);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-user-role-groups/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleGroup DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bpmnProcessUserRoleGroupRepository.deleteById(id);
  }
}
