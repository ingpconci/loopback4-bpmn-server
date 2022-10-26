import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  model,
  property,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param,
  patch, post,
  put,
  requestBody,
  response
} from '@loopback/rest';
import {Loopback4BpmnServerComponentBindings} from '../keys';
import {BpmnProcessInstance} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessInstanceRepository} from '../repositories';
import {BpmnServerEngineService} from '../services';
// debug
//import debugFactory from 'debug';
//const debug = debugFactory('loopback:bpmnserver-component:controller');
const debug = require('debug')('loopback:bpmn-server:controller');


@model()
export class ExecuteTaskInput {
  @property({
    type: 'string',
    required: true,
  })
  processInstanceItemId: string;
  @property({
    type: 'object',
    required: false,
    jsonSchema: {nullable: true},
  })
  dataJson?: object;
}

@model()
export class StartNewProcessInput {
  @property({
    type: 'string',
    required: true,
  })
  processName: string;
  @property({
    type: 'object',
    required: false,
    jsonSchema: {nullable: true},
  })
  dataJson?: object;
}


@authenticate('jwt')
export class BpmnProcessInstanceController {
  constructor(
    @repository(BpmnProcessInstanceRepository)
    public bpmnProcessInstanceRepository: BpmnProcessInstanceRepository,
    @inject(Loopback4BpmnServerComponentBindings.BPMN_ENGINE_SERVICE) private bpmnEngineService: BpmnServerEngineService,
  ) { }



  //---------------------------------------------------------------------
  // Invoke the execution of a process
  //---------------------------------------------------------------------
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @post('/bpmn-process-instances/start-process')
  @response(200, {
    description: 'BpmnProcessInstance start a new process result',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            requestResultMessage: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async startNewProcessInstance(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StartNewProcessInput, {
            title: 'StartNewProcessInput Data'
          }),
        },
      },
    })
    theStartNewProcessInput: StartNewProcessInput,
  ): Promise<{requestResultMessage: string}> {
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/start-process:  theStartNewProcessInput=', theStartNewProcessInput);
    debug('POST /bpmn-process-instances/start-process: theStartNewProcessInput=', theStartNewProcessInput);
    const inputData = theStartNewProcessInput.dataJson;//{ name1: 'value1' }
    const processName = theStartNewProcessInput.processName;

    const resultStartProcess = await this.bpmnEngineService.startProcess(processName, inputData);
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/start-process:  resultStartProcess=', resultStartProcess);
    if (!resultStartProcess) {
      throw new HttpErrors.InternalServerError('Error starting new Process of ' + processName);
    }
    return {
      requestResultMessage: 'Successfully start a new process instance of ' + processName
    };
  }

  //---------------------------------------------------------------------
  // Get the form of a user task
  //---------------------------------------------------------------------
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instances/user-task-forms/{id}')
  @response(200, {
    description: 'BpmnProcessInstance execute user task form result',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            requestResultMessage: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async getProcessInstanceTaskFormById(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExecuteTaskInput, {
            title: 'ExecuteTaskInput Data'
          }),
        },
      },
    })
    @param.path.number('id') id: string,
    theExecuteTaskInput: ExecuteTaskInput,
  ): Promise<{requestResultMessage: string}> {

    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  theExecuteTaskInput=', theExecuteTaskInput);


    //const processInstanceItemId = theExecuteTaskInput.processInstanceItemId;
    //const inputData = theExecuteTaskInput.dataJson;

    const processName = '';
    const elementId = id;
    const resultInvokeItem = await this.bpmnEngineService.getFields(processName, elementId)
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  resultInvokeItem=', resultInvokeItem);

    if (!resultInvokeItem) {
      throw new HttpErrors.InternalServerError('TEST BPMN');
    }

    return {
      requestResultMessage: 'Successfully invoked Item'
    };

  }

  //---------------------------------------------------------------------
  // Invoke the execution of a task
  //---------------------------------------------------------------------
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @post('/bpmn-process-instances/execute-task')
  @response(200, {
    description: 'BpmnProcessInstance execute task result',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            requestResultMessage: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async executeProcessInstanceTask(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ExecuteTaskInput, {
            title: 'ExecuteTaskInput Data'
          }),
        },
      },
    })
    theExecuteTaskInput: ExecuteTaskInput,
  ): Promise<{requestResultMessage: string}> {

    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  theExecuteTaskInput=', theExecuteTaskInput);


    const processInstanceItemId = theExecuteTaskInput.processInstanceItemId;
    const inputData = theExecuteTaskInput.dataJson;

    const resultInvokeItem = await this.bpmnEngineService.invokeProcessInstanceItem(processInstanceItemId, inputData);
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  resultInvokeItem=', resultInvokeItem);

    if (!resultInvokeItem) {
      throw new HttpErrors.InternalServerError('TEST BPMN');
    }

    return {
      requestResultMessage: 'Successfully invoked Item'
    };

  }





  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @post('/bpmn-process-instances')
  @response(200, {
    description: 'BpmnProcessInstance model instance',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessInstance)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstance, {
            title: 'NewBpmnProcessInstance',
            exclude: ['id'],
          }),
        },
      },
    })
    bpmnProcessInstance: Omit<BpmnProcessInstance, 'id'>,
  ): Promise<BpmnProcessInstance> {
    return this.bpmnProcessInstanceRepository.create(bpmnProcessInstance);
  }


  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.OPERATOR]
  })
  @get('/bpmn-process-instances/count')
  @response(200, {
    description: 'BpmnProcessInstance model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(BpmnProcessInstance) where?: Where<BpmnProcessInstance>,
  ): Promise<Count> {
    return this.bpmnProcessInstanceRepository.count(where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.OPERATOR]
  })
  @get('/bpmn-process-instances')
  @response(200, {
    description: 'Array of BpmnProcessInstance model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(BpmnProcessInstance, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(BpmnProcessInstance) filter?: Filter<BpmnProcessInstance>,
  ): Promise<BpmnProcessInstance[]> {
    return this.bpmnProcessInstanceRepository.find(filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-instances')
  @response(200, {
    description: 'BpmnProcessInstance PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstance, {partial: true}),
        },
      },
    })
    bpmnProcessInstance: BpmnProcessInstance,
    @param.where(BpmnProcessInstance) where?: Where<BpmnProcessInstance>,
  ): Promise<Count> {
    return this.bpmnProcessInstanceRepository.updateAll(bpmnProcessInstance, where);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @get('/bpmn-process-instances/{id}')
  @response(200, {
    description: 'BpmnProcessInstance model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(BpmnProcessInstance, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: string,
    @param.filter(BpmnProcessInstance, {exclude: 'where'}) filter?: FilterExcludingWhere<BpmnProcessInstance>
  ): Promise<BpmnProcessInstance> {
    return this.bpmnProcessInstanceRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @patch('/bpmn-process-instances/{id}')
  @response(204, {
    description: 'BpmnProcessInstance PATCH success',
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BpmnProcessInstance, {partial: true}),
        },
      },
    })
    bpmnProcessInstance: BpmnProcessInstance,
  ): Promise<void> {
    await this.bpmnProcessInstanceRepository.updateById(id, bpmnProcessInstance);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @put('/bpmn-process-instances/{id}')
  @response(204, {
    description: 'BpmnProcessInstance PUT success',
  })
  async replaceById(
    @param.path.number('id') id: string,
    @requestBody() bpmnProcessInstance: BpmnProcessInstance,
  ): Promise<void> {
    await this.bpmnProcessInstanceRepository.replaceById(id, bpmnProcessInstance);
  }

  @authorize({
    allowedRoles: [RoleKeys.ADMINISTRATOR]
  })
  @del('/bpmn-process-instances/{id}')
  @response(204, {
    description: 'BpmnProcessInstance DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.bpmnProcessInstanceRepository.deleteById(id);
  }
}

