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
import {BpmnProcessModel} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessModelRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessModelController {
  constructor(
    @repository(BpmnProcessModelRepository)
    public bpmnProcessModelRepository: BpmnProcessModelRepository,
  ) { }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-models')
  @response(200, {
    description: 'BpmnProcessModel model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessModel)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessModel, {
            title: 'NewBpmnProcessModel',

          }),
        },
      },
    })
    bpmnProcessModel: BpmnProcessModel,
  ): Promise<BpmnProcessModel> {
    return this.bpmnProcessModelRepository.create(bpmnProcessModel);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-models/count')
  @response(200, {
    description: 'BpmnProcessModel model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessModel) where?: Where<BpmnProcessModel>,
  ): Promise<Count> {
    return this.bpmnProcessModelRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-models')
  @response(200, {
    description: 'Array of BpmnProcessModel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessModel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessModel) filter?: Filter<BpmnProcessModel>,
  ): Promise<BpmnProcessModel[]> {
    return this.bpmnProcessModelRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-models')
  @response(200, {
    description: 'BpmnProcessModel PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessModel, {partial: true}),
        },
      },
    })
    bpmnProcessModel: BpmnProcessModel,
    @param.where(BpmnProcessModel) where?: Where<BpmnProcessModel>,
  ): Promise<Count> {
    return this.bpmnProcessModelRepository.updateAll(bpmnProcessModel, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-models/{id}')
  @response(200, {
    description: 'BpmnProcessModel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessModel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(BpmnProcessModel, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessModel>
  ): Promise<BpmnProcessModel> {
    return this.bpmnProcessModelRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessModel PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessModel, {partial: true}),
        },
      },
    })
    bpmnProcessModel: BpmnProcessModel,
  ): Promise<void> {
    await this.bpmnProcessModelRepository.updateById(id, bpmnProcessModel);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessModel PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() bpmnProcessModel: BpmnProcessModel,
  ): Promise<void> {
    await this.bpmnProcessModelRepository.replaceById(id, bpmnProcessModel);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-models/{id}')
  @response(204, {
    description: 'BpmnProcessModel DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.bpmnProcessModelRepository.deleteById(id);
  }
}
