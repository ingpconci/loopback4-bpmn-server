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
import {BpmnProcessUserRole} from '../models';
import { RoleKeys } from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessUserRoleController {
  constructor(
    @repository(BpmnProcessUserRoleRepository)
    public bpmnProcessUserRoleRepository : BpmnProcessUserRoleRepository,
  ) {}

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-user-roles')
  @response(200, {
    description: 'BpmnProcessUserRole model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserRole)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRole, {
            title: 'NewBpmnProcessUserRole',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessUserRole: Omit<BpmnProcessUserRole, 'id'>,
  ): Promise<BpmnProcessUserRole> {
    return this.bpmnProcessUserRoleRepository.create(bpmnProcessUserRole);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-roles/count')
  @response(200, {
    description: 'BpmnProcessUserRole model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessUserRole) where?: Where<BpmnProcessUserRole>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-roles')
  @response(200, {
    description: 'Array of BpmnProcessUserRole model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessUserRole, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessUserRole) filter?: Filter<BpmnProcessUserRole>,
  ): Promise<BpmnProcessUserRole[]> {
    return this.bpmnProcessUserRoleRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-roles')
  @response(200, {
    description: 'BpmnProcessUserRole PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRole, {partial: true}),
        },
      },
    })
    bpmnProcessUserRole: BpmnProcessUserRole,
    @param.where(BpmnProcessUserRole) where?: Where<BpmnProcessUserRole>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleRepository.updateAll(bpmnProcessUserRole, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-user-roles/{id}')
  @response(200, {
    description: 'BpmnProcessUserRole model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessUserRole, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BpmnProcessUserRole, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessUserRole>
  ): Promise<BpmnProcessUserRole> {
    return this.bpmnProcessUserRoleRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-user-roles/{id}')
  @response(204, {
    description: 'BpmnProcessUserRole PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRole, {partial: true}),
        },
      },
    })
    bpmnProcessUserRole: BpmnProcessUserRole,
  ): Promise<void> {
    await this.bpmnProcessUserRoleRepository.updateById(id, bpmnProcessUserRole);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-user-roles/{id}')
  @response(204, {
    description: 'BpmnProcessUserRole PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bpmnProcessUserRole: BpmnProcessUserRole,
  ): Promise<void> {
    await this.bpmnProcessUserRoleRepository.replaceById(id, bpmnProcessUserRole);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-user-roles/{id}')
  @response(204, {
    description: 'BpmnProcessUserRole DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bpmnProcessUserRoleRepository.deleteById(id);
  }
}
