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
import {AssignationInfo, BpmnProcessInstance, BpmnProcessUserRole, BpmnProcessUserTask} from '../models';
import {RoleKeys} from '../modules/multitenant-filter/role-key';
import {BpmnProcessInstanceRepository, BpmnProcessUserRoleRepository, UserRepository} from '../repositories';
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
    @repository(BpmnProcessInstanceRepository) public bpmnProcessInstanceRepository: BpmnProcessInstanceRepository,
    @inject(Loopback4BpmnServerComponentBindings.BPMN_ENGINE_SERVICE) private bpmnEngineService: BpmnServerEngineService,
    @repository(BpmnProcessUserRoleRepository) public bpmnProcessUserRoleRepository: BpmnProcessUserRoleRepository,
    @repository(UserRepository) public userRepository: UserRepository
  ) { }



  //==========================================================================================================================================
  // Invoke the execution of a process
  //==========================================================================================================================================
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
  ): Promise<{processInstanceId: string}> {
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/start-process:  theStartNewProcessInput=', theStartNewProcessInput);
    debug('POST /bpmn-process-instances/start-process: theStartNewProcessInput=', theStartNewProcessInput);
    const inputData = theStartNewProcessInput.dataJson;//{ name1: 'value1' }
    const processName = theStartNewProcessInput.processName;

    // call service
    const resultStartProcess = await this.bpmnEngineService.startProcess(processName, inputData);

    if (!resultStartProcess) {
      throw new HttpErrors.InternalServerError('Error starting new Process of ' + processName);
    }
    console.log('BpmnProcessInstanceController:POST /bpmn-process-instances/start-process:  resultStartProcess=', resultStartProcess);
    return resultStartProcess;
  }


  //==========================================================================================================================================
  // Get the list of waiting userTasks
  //==========================================================================================================================================
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instances/waiting-user-tasks')
  @response(200, {
    description: 'List of waiting userTask for the User',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserTask)}},
  })
  async getWaitingProcessInstanceUserTasks(
  ): Promise<Partial<BpmnProcessUserTask>[]> {
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks: ');

    const activeUserTaskArray = await this.bpmnEngineService.getWaitingProcessInstanceUserTasks();


    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks:  activeUserTaskArray.length=', activeUserTaskArray.length);
    return activeUserTaskArray;
  }

  //==========================================================================================================================================
  // Get the list of waiting userTask filtered by User
  //==========================================================================================================================================
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instances/waiting-user-tasks/user/{userId}')
  @response(200, {
    description: 'List of waiting userTask for the User',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserTask)}},
  })
  async getWaitingProcessInstanceUserTaskByUserId(
    @param.path.number('userId') userId: number
  ): Promise<Partial<BpmnProcessUserTask>[]> {
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/user/{userId}:  userId=', userId);

    // -------------------------------------------------------------------------
    // get all active userTask
    // -------------------------------------------------------------------------
    const resultActiveUserTaskArray: Partial<BpmnProcessUserTask>[] = await this.bpmnEngineService.getWaitingProcessInstanceUserTasks();
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/user/{userId}:  all user resultActiveUserTaskArray.length=', resultActiveUserTaskArray.length);

    const resultActiveUserTaskArrayFiltered: Partial<BpmnProcessUserTask>[] = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < resultActiveUserTaskArray.length; index++) {
      const activeUserTask = resultActiveUserTaskArray[index];
      const userTaskName = activeUserTask.taskName;
      const taskAssignedToRole = activeUserTask.taskAssignedRole;
      const processData = activeUserTask.processInstance.data;
      debug('getWaitingProcessInstanceUserTaskByUserId: ------------ index=', index, ' userTaskName=', userTaskName, ' ------------------');
      debug('getWaitingProcessInstanceUserTaskByUserId: processData=', processData);

      // -----------------------------------------------------------------------
      // get role
      // -----------------------------------------------------------------------
      const filterUserRole: Filter<BpmnProcessUserRole> = {
        where: {
          name: {
            eq: taskAssignedToRole
          }
        },
        include: [
          {
            relation: 'bpmnProcessUserRoleHasUsers'
          }
        ]
      }
      debug('getWaitingProcessInstanceUserTaskByUserId: finding bpmnProcessUserRole by name=', taskAssignedToRole);
      const bpmnProcessUserRoleArray = await this.bpmnProcessUserRoleRepository.find(filterUserRole);
      if (bpmnProcessUserRoleArray.length === 1) {
        const bpmnProcessUserRole = bpmnProcessUserRoleArray[0];
        debug('getWaitingProcessInstanceUserTaskByUserId: found bpmnProcessUserRole.name=', bpmnProcessUserRole.name);
        /*
        const exampleBpmnProcessUserRole = {
          id: 15,
          name: 'USER_NC_CATEGORY_MANAGER',
          description: 'ROLE user that manage nonconformity by category',
          note: null,
          bpmnProcessUserRoleGroupId: 3,
          propertiesJson: null,
          processVariableToFilterAssignedUsers: 'nonconformityCategoryId',
          processVariableToGetAssignedUserId: null,
          tenantId: 1,
          bpmnProcessUserRoleHasUsers: [
            {
              id: 22,
              bpmnProcessUserRoleId: 15,
              userId: 10,
              tenantId: 1,
              assignedUserFilterValueNumber: 1
            },
          ]
        }
        */
        //console.error('UserController.register: Email value is already taken');
        //throw new HttpErrors.Conflict('Email value is already taken');
        // ----------------------------------------------------------------------------------------
        // check permission
        // ----------------------------------------------------------------------------------------
        let taskIsAssignedToCurrentUser = false;
        debug('getWaitingProcessInstanceUserTaskByUserId: checking permission using different RULE....');

        if (bpmnProcessUserRole.processVariableToGetAssignedUserId) {
          // ---------------------------------------------------------------
          // processVariableToGetAssignedUserId
          // ---------------------------------------------------------------
          const propertyName = bpmnProcessUserRole.processVariableToGetAssignedUserId;
          const assignedUserId = processData[propertyName];
          debug('getWaitingProcessInstanceUserTaskByUserId: RULE processVariableToGetAssignedUserId=', propertyName, ' assignedUserId=', assignedUserId);
          if (userId === assignedUserId) {
            taskIsAssignedToCurrentUser = true;
            debug('getWaitingProcessInstanceUserTaskByUserId: userId === assignedUserId');
          }
          else {
            taskIsAssignedToCurrentUser = false;
          }
        }
        else if (bpmnProcessUserRole.processVariableToFilterAssignedUsers) {
          // ---------------------------------------------------------------
          // processVariableToFilterAssignedUsers
          // ---------------------------------------------------------------
          const propertyName = bpmnProcessUserRole.processVariableToFilterAssignedUsers;
          const filterAssignedUser = processData[propertyName];
          debug('getWaitingProcessInstanceUserTaskByUserId: RULE processVariableToFilterAssignedUsers=', propertyName, ' filterAssignedUser=', filterAssignedUser);
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let indexUser = 0; indexUser < bpmnProcessUserRole.bpmnProcessUserRoleHasUsers.length; indexUser++) {
            const bpmnProcessUserRoleHasUser = bpmnProcessUserRole.bpmnProcessUserRoleHasUsers[indexUser];
            if (userId === bpmnProcessUserRoleHasUser.userId && filterAssignedUser === bpmnProcessUserRoleHasUser.assignedUserFilterValueNumber) {
              debug('getWaitingProcessInstanceUserTaskByUserId: userId === bpmnProcessUserRoleHasUser.userId && filterAssignedUser === bpmnProcessUserRoleHasUser.assignedUserFilterValueNumber');
              taskIsAssignedToCurrentUser = true;
              break;
            }
          }
        }
        else {
          // ---------------------------------------------------------------
          // Role has current User
          // ---------------------------------------------------------------
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let indexUser = 0; indexUser < bpmnProcessUserRole.bpmnProcessUserRoleHasUsers.length; indexUser++) {
            const bpmnProcessUserRoleHasUser = bpmnProcessUserRole.bpmnProcessUserRoleHasUsers[indexUser];
            debug('getWaitingProcessInstanceUserTaskByUserId: RULE Role has current user. indexUser=', indexUser, ' bpmnProcessUserRoleHasUser.userId=', bpmnProcessUserRoleHasUser.userId);
            if (userId === bpmnProcessUserRoleHasUser.userId) {
              taskIsAssignedToCurrentUser = true;
              debug('getWaitingProcessInstanceUserTaskByUserId: RULE userId === bpmnProcessUserRoleHasUser.userId userId=', userId);
              break;
            }
          }

        }
        if (taskIsAssignedToCurrentUser === true) {
          debug('getWaitingProcessInstanceUserTaskByUserId: taskIsAssignedToCurrentUser=== true!');
          resultActiveUserTaskArrayFiltered.push(activeUserTask);
        }
      }
    }
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/{userId}: End  resultActiveUserTaskArrayFiltered.length=', resultActiveUserTaskArrayFiltered.length);

    return resultActiveUserTaskArrayFiltered;
    /*
    const errorMessage = 'Error: Method not implemented'
    console.error('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/user/{userId}: ', errorMessage);
    throw new HttpErrors.MethodNotAllowed(errorMessage);
    */
  }


  //==========================================================================================================================================
  // Get the waiting userTask filtered by processInstanceItemId
  // TODO: aggiungere filtro per utente, in modo che non possa eseguire task per i quali non è assegnato
  //==========================================================================================================================================
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instances/waiting-user-tasks/processInstanceItemId/{processInstanceItemId}')
  @response(200, {
    description: 'UserTask for the processInstanceItemId',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserTask)}},
  })
  async getWaitingProcessInstanceUserTaskByProcessInstanceItemId(
    @param.path.string('processInstanceItemId') processInstanceItemId: string
  ): Promise<Partial<BpmnProcessUserTask>> {
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/processInstanceItemId/{processInstanceItemId}:  processInstanceItemId=', processInstanceItemId);

    // -------------------------------------------------------------------------
    // get all active userTask
    // -------------------------------------------------------------------------
    const resultActiveUserTaskArray: Partial<BpmnProcessUserTask>[] = await this.bpmnEngineService.getWaitingProcessInstanceUserTasks();
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/processInstanceItemId/{processInstanceItemId}:  all user resultActiveUserTaskArray.length=', resultActiveUserTaskArray.length);

    let resultActiveUserTask: Partial<BpmnProcessUserTask> = undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < resultActiveUserTaskArray.length; index++) {
      const activeUserTask = resultActiveUserTaskArray[index];
      //const userTaskName = activeUserTask.userTaskName;
      /*
      const exampleActiveUserTask = {
        processInstanceId: '0e6dacbf-7813-426f-ae5d-58c8b9a14fce',
        processInstanceName: 'fbk-sd-mnf_NC-main_rev1',
        processInstanceCounter: 126,
        processInstanceDescription: '',
        processData: {
          tenantId: 1,
          startProcessUserId: 25,
          nonconformityCategoryId: 1,
          nonconformityPriorityId: 2,
          nonconformityStatusId: 1,
          nonconformityId: 1025,
          firstCorrectionFeasibility: 'No'
        },
        processInstanceItemId: '18f936db-d7ca-48ae-b4df-2636c67045e5',
        userTaskName: '(5.0)Si Puo Fare Correzione',
        startedAt: '2023-03-09T13:55:55.300Z',
        elementId: 'Activity_1db81yb',
        taskAssignedToRole: 'USER_NC_CATEGORY_MANAGER'
      }
      */
      //const taskAssignedToRole = activeUserTask.taskAssignedToRole;
      //const processData = activeUserTask.processData;
      //debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/processInstanceItemId/{processInstanceItemId}: ------------ index=', index, ' activeUserTask=', activeUserTask);

      if (activeUserTask.processInstanceItem.id === processInstanceItemId) {

        resultActiveUserTask = activeUserTask;
      }
    }

    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/processInstanceItemId/{processInstanceItemId}: End resultActiveUserTask=', resultActiveUserTask);

    return resultActiveUserTask;

    /*
    const errorMessage = 'Error: Method not implemented'
    console.error('BpmnProcessInstanceController:GET /bpmn-process-instances/waiting-user-tasks/user/{userId}: ', errorMessage);
    throw new HttpErrors.MethodNotAllowed(errorMessage);
    */
  }


  //==========================================================================================================================================
  // Get the userTask by processInstanceId and elementId with assignation info
  //==========================================================================================================================================
  @authorize({
    allowedRoles: [RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
  })
  @get('/bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}')
  @response(200, {
    description: 'UserTask by id',
    content: {'application/json': {schema: getModelSchemaRef(BpmnProcessUserTask)}},
  })
  async getProcessInstanceUserTaskByElementId(
    @param.path.string('processInstanceId') processInstanceId: string,
    @param.path.string('elementId') elementId: string
  ): Promise<Partial<BpmnProcessUserTask>> {
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}}: processInstanceId=', processInstanceId, ' elementId=', elementId);

    // ----------------------------------------------------------------------------------------
    // get bpmnProcessUserTask
    // ----------------------------------------------------------------------------------------
    const bpmnProcessUserTask = await this.bpmnEngineService.getProcessInstanceUserTaskByElementId(processInstanceId, elementId);
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}:  bpmnProcessUserTask=', bpmnProcessUserTask);

    // ----------------------------------------------------------------------------------------
    // get assignation info
    // ----------------------------------------------------------------------------------------
    const userTaskName = bpmnProcessUserTask.taskName;
    const taskAssignedToRole = bpmnProcessUserTask.taskAssignedRole;
    const processData = bpmnProcessUserTask.processInstance.data;
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}: processData=', processData);



    // -------------------------------------------------------------------------
    // get role
    // -------------------------------------------------------------------------
    const filterUserRole: Filter<BpmnProcessUserRole> = {
      where: {
        name: {
          eq: taskAssignedToRole
        }
      },
      include: [
        {
          relation: 'bpmnProcessUserRoleHasUsers', scope: {
            fields: {
              id: true,
              bpmnProcessUserRoleId: true,
              userId: true,
              assignedUserFilterValueNumber: true
            },
            include: [
              {
                relation: 'user', scope: {fields: {id: true, firstname: true, lastname: true}}
              },
            ]
          }
        },
      ]
    }
    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}: finding bpmnProcessUserRole by name=', taskAssignedToRole);
    const bpmnProcessUserRoleArray = await this.bpmnProcessUserRoleRepository.find(filterUserRole);
    if (bpmnProcessUserRoleArray.length === 1) {
      const bpmnProcessUserRole = bpmnProcessUserRoleArray[0];
      debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}: found bpmnProcessUserRole.name=', bpmnProcessUserRole.name);

      debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}: checking permission using different RULE....');

      if (bpmnProcessUserRole.processVariableToGetAssignedUserId) {
        // ---------------------------------------------------------------
        // processVariableToGetAssignedUserId
        // ---------------------------------------------------------------
        const propertyName = bpmnProcessUserRole.processVariableToGetAssignedUserId;
        const assignedUserId: number = processData[propertyName];
        debug('BpmnProcessInstanceController:GET /bpmn-process-instances/{processInstanceId}/user-tasks/{elementId}: RULE processVariableToGetAssignedUserId=', propertyName, ' assignedUserId=', assignedUserId);

        // -------------------------------------------------
        // get user info
        // -------------------------------------------------
        let user = undefined;
        if (assignedUserId) {
          user = await this.userRepository.findOne({
            where: {
              id: {
                eq: assignedUserId
              }
            },
            fields: {
              id: true,
              firstname: true,
              lastname: true
            }
          });
          // new assignationInfo
          const assignationInfo: AssignationInfo = {
            assignedUsers: [
              {
                id: assignedUserId,
                firstname: user ? user.firstname : '--',
                lastname: user ? user.lastname : '--',
              }
            ]
          }
          // add assegnationInfo
          bpmnProcessUserTask.taskAssignationInfo = assignationInfo;
        }
        /*
        // new assignationInfo
        const assignationInfo: AssignationInfo = {
          assignedUsers: [
            {
              id: assignedUserId,
              firstname: user ? user.firstname : 'no-name',
              lastname: user ? user.lastname : 'no-name',
            }
          ]
        }
        // add assegnationInfo
        bpmnProcessUserTask.taskAssignationInfo = assignationInfo;
        */

      }
      else if (bpmnProcessUserRole.processVariableToFilterAssignedUsers) {
        // ---------------------------------------------------------------
        // processVariableToFilterAssignedUsers
        // ---------------------------------------------------------------
        const propertyName = bpmnProcessUserRole.processVariableToFilterAssignedUsers;
        const filterAssignedUser = processData[propertyName];
        debug('BpmnProcessInstanceController:GET /bpmn-process-instances/user-tasks/{elementId}: RULE processVariableToFilterAssignedUsers=', propertyName, ' filterAssignedUser=', filterAssignedUser);
        const assignationInfo: AssignationInfo = {
          assignedUsers: []
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexUser = 0; indexUser < bpmnProcessUserRole.bpmnProcessUserRoleHasUsers.length; indexUser++) {
          const bpmnProcessUserRoleHasUser = bpmnProcessUserRole.bpmnProcessUserRoleHasUsers[indexUser];
          if (filterAssignedUser === bpmnProcessUserRoleHasUser.assignedUserFilterValueNumber) {
            debug('BpmnProcessInstanceController:GET /bpmn-process-instances/user-tasks/{elementId}: filterAssignedUser === bpmnProcessUserRoleHasUser.assignedUserFilterValueNumber');
            // -------------------------------------------------
            // get user info
            // -------------------------------------------------
            let user = undefined;
            if (bpmnProcessUserRoleHasUser.userId) {
              user = await this.userRepository.findOne({
                where: {
                  id: {
                    eq: bpmnProcessUserRoleHasUser.userId
                  }
                },
                fields: {
                  id: true,
                  firstname: true,
                  lastname: true
                }
              });
              // new assignationInfo
              assignationInfo.assignedUsers.push(
                {
                  id: bpmnProcessUserRoleHasUser.userId,
                  firstname: user ? user.firstname : '--',
                  lastname: user ? user.lastname : '--',
                }
              );
            }
            /*
            // new assignationInfo
            assignationInfo.assignedUsers.push(
              {
                id: bpmnProcessUserRoleHasUser.userId,
                firstname: user ? user.firstname : 'no-name',
                lastname: user ? user.lastname : 'no-name',
              }
            );
            */
          }
        }
        // add assegnationInfo
        bpmnProcessUserTask.taskAssignationInfo = assignationInfo;
      }
      else {
        // ---------------------------------------------------------------
        // Role has Users
        // ---------------------------------------------------------------
        const assignationInfo: AssignationInfo = {
          assignedUsers: []
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexUser = 0; indexUser < bpmnProcessUserRole.bpmnProcessUserRoleHasUsers.length; indexUser++) {
          const bpmnProcessUserRoleHasUser = bpmnProcessUserRole.bpmnProcessUserRoleHasUsers[indexUser];
          debug('BpmnProcessInstanceController:GET /bpmn-process-instances/user-tasks/{elementId}: RULE Role has current user. indexUser=', indexUser, ' bpmnProcessUserRoleHasUser.userId=', bpmnProcessUserRoleHasUser.userId);
          // -------------------------------------------------
          // get user info
          // -------------------------------------------------
          let user = undefined;
          if (bpmnProcessUserRoleHasUser.userId) {
            user = await this.userRepository.findOne({
              where: {
                id: {
                  eq: bpmnProcessUserRoleHasUser.userId
                }
              },
              fields: {
                id: true,
                firstname: true,
                lastname: true
              }
            });
            // new assignationInfo
            assignationInfo.assignedUsers.push(
              {
                id: bpmnProcessUserRoleHasUser.userId,
                firstname: user ? user.firstname : '--',
                lastname: user ? user.lastname : '--',
              }
            );
          }
          // new assignationInfo
          /*
          assignationInfo.assignedUsers.push(
            {
              id: bpmnProcessUserRoleHasUser.userId,
              firstname: user ? user.firstname : 'no-name',
              lastname: user ? user.lastname : 'no-name',
            }
          );
          */

        }
        // add assegnationInfo
        bpmnProcessUserTask.taskAssignationInfo = assignationInfo;
      }
    }

    debug('BpmnProcessInstanceController:GET /bpmn-process-instances/user-tasks/{elementId}:  bpmnProcessUserTask=', bpmnProcessUserTask);
    return bpmnProcessUserTask;
  }

  //---------------------------------------------------------------------
  // Get the form of a user task
  //---------------------------------------------------------------------
  /*
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
    @param.path.string('id') id: string,
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
  */




  //----------------------------------------------------------------------------
  // Invoke the execution of a task
  // TODO: aggiungere filtro per utente, in modo che non possa eseguire task per i quali non è assegnato
  //----------------------------------------------------------------------------
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

    debug('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  theExecuteTaskInput=', theExecuteTaskInput);


    const processInstanceItemId = theExecuteTaskInput.processInstanceItemId;
    const inputData = theExecuteTaskInput.dataJson;

    const resultInvokeItem = await this.bpmnEngineService.invokeProcessInstanceItem(processInstanceItemId, inputData);
    debug('BpmnProcessInstanceController:POST /bpmn-process-instances/execute-task:  resultInvokeItem=', resultInvokeItem);

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
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
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
    allowedRoles: [RoleKeys.ADMINISTRATOR, RoleKeys.SUPERUSER, RoleKeys.OPERATOR, RoleKeys.MAINTAINER]
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
    @param.path.string('id') id: string,
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
    @param.path.string('id') id: string,
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
    @param.path.string('id') id: string,
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

