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
import {BpmnProcessUserRoleHasBpmnProcessModel} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessUserRoleHasBpmnProcessModelRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessUserRoleHasBpmnProcessModelController {
  constructor(
    @repository(BpmnProcessUserRoleHasBpmnProcessModelRepository)
    public bpmnProcessUserRoleHasBpmnProcessModelRepository: BpmnProcessUserRoleHasBpmnProcessModelRepository,
  ) { }

  @authorize({
    allowedRoles: [
      RoleKeys.ADMINISTRATOR,
    ],
  })
  @post('/bpmn-process-user-role-has-bpmn-process-models')
  @response(200, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel, {
            title: 'NewBpmnProcessUserRoleHasBpmnProcessModel',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessUserRoleHasBpmnProcessModel: Omit<BpmnProcessUserRoleHasBpmnProcessModel, 'id'>,
  ): Promise<BpmnProcessUserRoleHasBpmnProcessModel> {
    return this.bpmnProcessUserRoleHasBpmnProcessModelRepository.create(bpmnProcessUserRoleHasBpmnProcessModel);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.OPERATOR, RoleKeys.VIEWER, RoleKeys.SUPERUSER, RoleKeys.MAINTAINER, RoleKeys.ADMINISTRATOR
    ],
  })
  @get('/bpmn-process-user-role-has-bpmn-process-models/count')
  @response(200, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessUserRoleHasBpmnProcessModel) where?: Where<BpmnProcessUserRoleHasBpmnProcessModel>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleHasBpmnProcessModelRepository.count(where);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.OPERATOR, RoleKeys.VIEWER, RoleKeys.SUPERUSER, RoleKeys.MAINTAINER, RoleKeys.ADMINISTRATOR
    ],
  })
  @get('/bpmn-process-user-role-has-bpmn-process-models')
  @response(200, {
    description: 'Array of BpmnProcessUserRoleHasBpmnProcessModel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessUserRoleHasBpmnProcessModel) filter?: Filter<BpmnProcessUserRoleHasBpmnProcessModel>,
  ): Promise<BpmnProcessUserRoleHasBpmnProcessModel[]> {
    return this.bpmnProcessUserRoleHasBpmnProcessModelRepository.find(filter);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.ADMINISTRATOR,
    ],
  })
  @patch('/bpmn-process-user-role-has-bpmn-process-models')
  @response(200, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleHasBpmnProcessModel: BpmnProcessUserRoleHasBpmnProcessModel,
    @param.where(BpmnProcessUserRoleHasBpmnProcessModel) where?: Where<BpmnProcessUserRoleHasBpmnProcessModel>,
  ): Promise<Count> {
    return this.bpmnProcessUserRoleHasBpmnProcessModelRepository.updateAll(bpmnProcessUserRoleHasBpmnProcessModel, where);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.OPERATOR, RoleKeys.VIEWER, RoleKeys.SUPERUSER, RoleKeys.MAINTAINER, RoleKeys.ADMINISTRATOR
    ],
  })
  @get('/bpmn-process-user-role-has-bpmn-process-models/{id}')
  @response(200, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BpmnProcessUserRoleHasBpmnProcessModel, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessUserRoleHasBpmnProcessModel>
  ): Promise<BpmnProcessUserRoleHasBpmnProcessModel> {
    return this.bpmnProcessUserRoleHasBpmnProcessModelRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.ADMINISTRATOR,
    ],
  })
  @patch('/bpmn-process-user-role-has-bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessUserRoleHasBpmnProcessModel, {partial: true}),
        },
      },
    })
    bpmnProcessUserRoleHasBpmnProcessModel: BpmnProcessUserRoleHasBpmnProcessModel,
  ): Promise<void> {
    await this.bpmnProcessUserRoleHasBpmnProcessModelRepository.updateById(id, bpmnProcessUserRoleHasBpmnProcessModel);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.ADMINISTRATOR,
    ],
  })
  @put('/bpmn-process-user-role-has-bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bpmnProcessUserRoleHasBpmnProcessModel: BpmnProcessUserRoleHasBpmnProcessModel,
  ): Promise<void> {
    await this.bpmnProcessUserRoleHasBpmnProcessModelRepository.replaceById(id, bpmnProcessUserRoleHasBpmnProcessModel);
  }

  @authorize({
    allowedRoles: [
      RoleKeys.ADMINISTRATOR,
    ],
  })
  @del('/bpmn-process-user-role-has-bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessUserRoleHasBpmnProcessModel DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bpmnProcessUserRoleHasBpmnProcessModelRepository.deleteById(id);
  }
}
