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
import {BpmnProcessInstanceHasUserTask} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessInstanceHasUserTaskRepository} from '../repositories';

@authenticate('jwt')
export class BpmnProcessInstanceHasUserTaskController {
  constructor(
    @repository(BpmnProcessInstanceHasUserTaskRepository)
    public bpmnProcessInstanceHasUserTaskRepository: BpmnProcessInstanceHasUserTaskRepository,
  ) { }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-instance-has-user-tasks')
  @response(200, {
    description: 'BpmnProcessInstanceHasUserTask model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessInstanceHasUserTask)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstanceHasUserTask, {
            title: 'NewBpmnProcessInstanceHasUserTask',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessInstanceHasUserTask: Omit<BpmnProcessInstanceHasUserTask, 'id'>,
  ): Promise<BpmnProcessInstanceHasUserTask> {
    return this.bpmnProcessInstanceHasUserTaskRepository.create(bpmnProcessInstanceHasUserTask);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instance-has-user-tasks/count')
  @response(200, {
    description: 'BpmnProcessInstanceHasUserTask model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessInstanceHasUserTask) where?: Where<BpmnProcessInstanceHasUserTask>,
  ): Promise<Count> {
    return this.bpmnProcessInstanceHasUserTaskRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instance-has-user-tasks')
  @response(200, {
    description: 'Array of BpmnProcessInstanceHasUserTask model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessInstanceHasUserTask, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessInstanceHasUserTask) filter?: Filter<BpmnProcessInstanceHasUserTask>,
  ): Promise<BpmnProcessInstanceHasUserTask[]> {
    return this.bpmnProcessInstanceHasUserTaskRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-instance-has-user-tasks')
  @response(200, {
    description: 'BpmnProcessInstanceHasUserTask PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstanceHasUserTask, {partial: true}),
        },
      },
    })
    bpmnProcessInstanceHasUserTask: BpmnProcessInstanceHasUserTask,
    @param.where(BpmnProcessInstanceHasUserTask) where?: Where<BpmnProcessInstanceHasUserTask>,
  ): Promise<Count> {
    return this.bpmnProcessInstanceHasUserTaskRepository.updateAll(bpmnProcessInstanceHasUserTask, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instance-has-user-tasks/{id}')
  @response(200, {
    description: 'BpmnProcessInstanceHasUserTask model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessInstanceHasUserTask, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(BpmnProcessInstanceHasUserTask, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessInstanceHasUserTask>
  ): Promise<BpmnProcessInstanceHasUserTask> {
    return this.bpmnProcessInstanceHasUserTaskRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @patch('/bpmn-process-instance-has-user-tasks/{id}')
  @response(204, {
    description: 'BpmnProcessInstanceHasUserTask PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstanceHasUserTask, {partial: true}),
        },
      },
    })
    bpmnProcessInstanceHasUserTask: BpmnProcessInstanceHasUserTask,
  ): Promise<void> {
    await this.bpmnProcessInstanceHasUserTaskRepository.updateById(id, bpmnProcessInstanceHasUserTask);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-instance-has-user-tasks/{id}')
  @response(204, {
    description: 'BpmnProcessInstanceHasUserTask PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() bpmnProcessInstanceHasUserTask: BpmnProcessInstanceHasUserTask,
  ): Promise<void> {
    await this.bpmnProcessInstanceHasUserTaskRepository.replaceById(id, bpmnProcessInstanceHasUserTask);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-instance-has-user-tasks/{id}')
  @response(204, {
    description: 'BpmnProcessInstanceHasUserTask DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bpmnProcessInstanceHasUserTaskRepository.deleteById(id);
  }
}
