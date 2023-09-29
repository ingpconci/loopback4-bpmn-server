import { /* inject, */ BindingScope, ContextTags, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BPMNServer, Behaviour_names, Logger} from 'bpmn-server/index';
import {Loopback4BpmnServerComponent} from '../component';
import {Loopback4BpmnServerComponentBindings} from '../keys';
import {configuration} from '../libraries/bpmn-server/configuration';
import {BpmnProcessInstance} from '../models/bpmn-process-instance.model';
import {BpmnProcessInstanceRepository} from '../repositories/bpmn-process-instance.repository';
import {BpmnProcessModelRepository} from '../repositories/bpmn-process-model.repository';
//
import BpmnModdle from 'bpmn-moddle';
import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import {BpmnProcessInstanceHasUserTask, BpmnProcessUserTask} from '../models';
import {BpmnProcessInstanceHasUserTaskRepository} from '../repositories';

const debug = require('debug')('loopback:bpmn-server:services:bpmn-engine');

/*
@model()
export class ActiveUserTask {
  @property() taskName: string;
  @property() taskDescription?: string;
  @property() taskElementId: string;
  @property() taskStartedAt: string;
  @property() taskAssignedToRole: string;
  @property() processInstanceId: string;
  @property() processInstance?: ProcessInstance;
  @property() processInstanceItemId: string;
  @property() processInstanceItem?: ProcessInstanceItem;
  @property() assignationInfo?: AssignationInfo;
}

@model()
export class ProcessInstance {
  @property() id: string;
  @property() name: string;
  @property() counter: number;
  @property() status: string;
  @property() startedAt: string;
  @property() endedAt: string;
  @property() data: string;
}

@model()
export class ProcessInstanceItem {
  @property() id: string;
  @property() name: string;
  @property() status: number;
  @property() startedAt: number;
}

@model()
export class AssignationInfo {
  @property() assignedUsers: AssignedUser[];
}


export class AssignedUser {
  @property() id: number;
  @property() firstname: string;
  @property() lastname: string;
}
*/

/*
@model()
export class ActiveUserTaskOld extends Model {
  @property({
    type: 'string',
    required: true,
  })
  processInstanceId: string;
  @property({
    type: 'string',
    required: true,
  })
  processInstanceName: string;

  @property({
    type: 'number',
    required: true,
  })
  processInstanceCounter: number;

  // processInstanceStatus
  @property({
    type: 'string',
    required: true,
  })
  processInstanceStatus: string;

  // processInstanceData
  @property({
    type: 'string',
    required: true,
  })
  processInstanceData: string;

  // processInstanceStartedAt
  @property({
    type: 'string',
    required: true,
  })
  processInstanceStartedAt: string;

  // processInstanceEndedAt
  @property({
    type: 'string',
    required: true,
  })
  processInstanceEndedAt: string;


  @property({
    type: 'string',
    required: true,
  })
  processInstanceItemId: string;

  @property({
    type: 'object',
    required: true,
  })
  processInstanceItem?: object;


  // taskAssignedToRole
  @property({
    type: 'string',
    required: true,
  })
  taskAssignedToRole?: string;

  @property({
    type: 'object',
    required: true,
  })
  assignationInfo?: object;

  @property({
    type: 'string',
    required: true,
  })
  userTaskName: string;

  @property({
    type: 'string',
    required: true,
  })
  startedAt: string;

  @property({
    type: 'string',
    required: true,
  })
  elementId: string;

  @property({
    type: 'object',
    required: false,
    jsonSchema: {nullable: true},
  })
  dataJson?: object;

}
*/



@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: Loopback4BpmnServerComponentBindings.BPMN_ENGINE_SERVICE}
})
export class BpmnServerEngineService {
  private bpmnServer: BPMNServer;

  constructor(
    @inject(Loopback4BpmnServerComponentBindings.COMPONENT) private component: Loopback4BpmnServerComponent,
    @repository(BpmnProcessInstanceRepository) public bpmnProcessInstanceRepository: BpmnProcessInstanceRepository,
    @repository(BpmnProcessModelRepository) public bpmnProcessModelRepository: BpmnProcessModelRepository,
    @repository(BpmnProcessInstanceHasUserTaskRepository) public bpmnProcessInstanceHasUserTaskRepository: BpmnProcessInstanceHasUserTaskRepository,
  ) {
    debug('BpmnEngineService.constructor: Starting...');
    this.bpmnServer = component.bpmnServer;
  }

  //==========================================================================================================================================
  // startBpmnServer
  //==========================================================================================================================================
  startBpmnServer(): void {
    //console.log('BpmnEngineService.startBpmnServer: Start');
    debug('BpmnEngineService.startBpmnServer: Start');
    //----------------------------------------------------------------------------------
    // Start instance of  BPMNServer
    //----------------------------------------------------------------------------------
    //console.log('BpmnEngineService.startBpmnServer: Start instance of  BPMNServer................');
    debug('BpmnEngineService.startBpmnServer: Start instance of  BPMNServer................');
    configuration.definitionsPath = this.component.options.bpmnProcessDefinitionDirectory;

    //console.log('BpmnEngineService.startBpmnServer: options.configuration.definitionsPath=', configuration.definitionsPath);
    debug('BpmnEngineService.startBpmnServer: options.configuration.definitionsPath=', configuration.definitionsPath);

    // attach repositories instances
    configuration.database.loopbackRepositories.bpmnProcessInstanceRepository = this.bpmnProcessInstanceRepository;
    configuration.database.loopbackRepositories.bpmnProcessModelRepository = this.bpmnProcessModelRepository;
    // create the server
    this.bpmnServer = new BPMNServer(configuration, new Logger({toConsole: false, toFile: '', callback: null}));

    //this.bpmnServer = new BPMNServer(configuration, this.bpmnProcessInstanceRepository, this.bpmnProcessModelRepository);

    debug('BpmnEngineService.startBpmnServer: End');
    //console.log('BpmnEngineService.startBpmnServer: End');

  }


  //==========================================================================================================================================
  // startProcess
  //==========================================================================================================================================
  async startProcess(processName: string, inputData: any): Promise<{
    processInstanceId: string
  }> {
    debug('BpmnEngineService.startProcess: Start');

    //----------------------------------------------------------------------------------
    // Start Process
    //----------------------------------------------------------------------------------
    const startEngineResult = await this.bpmnServer.engine.start(processName, inputData);
    //console.log('BpmnEngineService.startProcess: startEngineResult=', startEngineResult);

    const processInstance = startEngineResult.instance;
    //console.log('BpmnEngineService.startProcess: processInstance=', processInstance);
    console.log('BpmnEngineService.startProcess: process started, name=', processInstance.name, ' id=', processInstance.id);
    console.log('BpmnEngineService.startProcess: items=', processInstance.items);
    console.log('BpmnEngineService.startProcess: tokens=', processInstance.tokens);

    const items = processInstance.items.filter(item => {
      return (item.status === 'wait');
    });
    items.forEach(item => {
      //console.log(`  waiting for <${item.name}> -<${item.elementId}> id: <${item.id}> `);
      console.log('BpmnEngineService.startProcess: waiting item: name=', item.name, ' elementId=', item.elementId, ' id=', item.id);
    });

    /*
    startEngineResult= <ref *2> Execution {
      server: <ref *1> BPMNServer {
        listener: EventEmitter {
          _events: [Object: null prototype],
          _eventsCount: 5,
          _maxListeners: undefined,
          [Symbol(kCapture)]: false
        },
        logger: Logger {
          debugMsgs: [Array],
          toConsole: false,
          toFile: '',
          callback: null
        },
        configuration: Configuration {
          definitionsPath: 'C:\\Users\\Paolo Conci\\Documents\\PROJECTS_LOCAL_WORKSPACE\\L_FBK_MNFLims\\APP_SERVER\\fbk-fablims-server\\processes\\',
          templatesPath: 'C:\\Users\\Paolo Conci\\Documents\\PROJECTS_LOCAL_WORKSPACE\\MFS_FABLIMS\\APP_SERVER\\PUBLIC_loopback4-bpmn-server\\dist\\libraries\\bpmn-server/emailTemplates/',
          timers: [Object],
          database: [Object],
          apiKey: '',
          logger: [Function: logger],
          definitions: [Function: definitions],
          appDelegate: [Function: appDelegate],
          dataStore: [Function: dataStore]
        },
        cron: Cron { server: [Circular *1] },
        cache: CacheManager { server: [Circular *1] },
        engine: Engine { server: [Circular *1] },
        dataStore: CustomDataStore {
          server: [Circular *1],
          isModified: false,
          isRunning: false,
          inSaving: false,
          promises: [],
          saveCounter: 0
        },
        definitions: CustomModelsDatastore {
          server: [Circular *1],
          dbConfiguration: [Object],
          db: [MongoDB],
          definitionsPath: 'C:\\Users\\Paolo Conci\\Documents\\PROJECTS_LOCAL_WORKSPACE\\L_FBK_MNFLims\\APP_SERVER\\fbk-fablims-server\\processes\\'
        },
        appDelegate: MyAppDelegate {
          server: [Circular *1],
          servicesProvider: MyServices {}
        },
        acl: ACL { server: [Circular *1], listener: [EventEmitter] },
        iam: IAM { server: [Circular *1] }
      },
      tokens: Map(1) {
        0 => Token {
          execution: [Circular *2],
          type: 'Primary',
          dataPath: '',
          startNodeId: 'StartEvent_1',
          currentNode: [UserTask],
          parentToken: null,
          originItem: null,
          id: 0,
          processId: 'Process_07ii97u',
          path: [Array],
          loop: null,
          status: 'wait'
        }
      },
      input: { tenantId: 1, startProcessUserId: 10 },
      output: {},
      promises: [],
      uids: { token: 1, item: 3 },
      instance: InstanceObject {
        items: [
            {
              id: 'f93876ec-7608-4af1-a931-b0a68a2a5326',
              seq: 0,
              itemKey: undefined,
              tokenId: 0,
              elementId: 'StartEvent_1',
              name: undefined,
              status: 'end',
              userId: undefined,
              startedAt: '2023-09-27T09:12:30.985Z',
              endedAt: '2023-09-27T09:12:31.013Z',
              type: 'bpmn:StartEvent',
              timeDue: undefined,
              data: null,
              vars: {},
              instanceId: undefined,
              messageId: undefined,
              signalId: undefined,
              assignments: [],
              authorizations: [],
              notifications: []
            },
            {
              id: '73da7c9e-7c85-4c0a-a6a6-4bc777ed46e8',
              seq: 1,
              itemKey: undefined,
              tokenId: 0,
              elementId: 'Flow_0snq4em',
              name: undefined,
              status: 'end',
              userId: undefined,
              startedAt: undefined,
              endedAt: null,
              type: 'bpmn:SequenceFlow',
              timeDue: undefined,
              data: null,
              vars: {},
              instanceId: undefined,
              messageId: undefined,
              signalId: undefined,
              assignments: [],
              authorizations: [],
              notifications: []
            },
            {
              id: '511e4ad7-650c-4e44-83a3-10d2e504de2c',
              seq: 2,
              itemKey: undefined,
              tokenId: 0,
              elementId: 'Activity_1jg0x3o',
              name: '(1.1) Scelta Categoria',
              status: 'wait',
              userId: undefined,
              startedAt: '2023-09-27T09:12:31.015Z',
              endedAt: null,
              type: 'bpmn:UserTask',
              timeDue: undefined,
              data: null,
              vars: {},
              instanceId: undefined,
              messageId: undefined,
              signalId: undefined,
              assignments: [],
              authorizations: [],
              notifications: []
            }
          ],


        logs: [
          'ACTION:execute:',
          '..starting at :StartEvent_1',
          'Token(*).startNewToken:  starting new Token with id=0 start node=StartEvent_1',
          'Token(0).execute: inputnull',
          'Token(0).execute: new Item created itemId=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Token(0).execute: executing currentNodeId=StartEvent_1',
          'Node(undefined|StartEvent_1).execute: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).execute: execute enter ...',
          'Node(undefined|StartEvent_1).doEvent: executing script for event:enter',
          'Node(undefined|StartEvent_1).enter: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).execute: execute start ...',
          'Node(undefined|StartEvent_1).doEvent: executing script for event:start',
          'Node(undefined|StartEvent_1).start: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).startBoundaryEvents: itemId=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).execute: execute run ...',
          'Node(undefined|StartEvent_1).run: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).execute: execute continue...',
          'Node(undefined|StartEvent_1).continue: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).end: item=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Node(undefined|StartEvent_1).doEvent: executing script for event:end',
          'Node(undefined|StartEvent_1).end: setting item status to end itemId=3d36d0ac-fe3c-437d-a8a3-849b415636a0 itemStatus=end',
          'Node(undefined|StartEvent_1).end: finished',
          'Token(0).execute: executing currentNodeId=StartEvent_1 itemId=3d36d0ac-fe3c-437d-a8a3-849b415636a0 is done!',
          'Token(0).goNext(): currentNodeId=StartEvent_1 type=bpmn:StartEvent currentItem.status=end',
          'Node(undefined|StartEvent_1).getOutbounds: itemId=3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          'Flow(undefined|Flow_0snq4em).run: from=undefined to=(1.1) Scelta Categoria find action... ',
          'Flow(undefined|Flow_0snq4em).run: going to Activity_1jg0x3o action : take',
          'Node(undefined|StartEvent_1).getOutbounds: return outbounds1',
          'Token(0).goNext(): verify outbonds....',
          'Token(0).goNext(): ... outbonds flowItemId=245b7b56-5611-469d-ba0f-7e57ce5fc4f9',
          'Token(0).goNext(): ... currentNodeId(undefined|StartEvent_1) processing  Flow(Flow_0snq4em) to Activity_1jg0x3o',
          'Token(0).execute: inputnull',
          'Token(0).goNext(): waiting for num promises 1',
          'Token(0).execute: new Item created itemId=110d92bd-464a-422d-94e1-9d1fca4c7654',
          'Token(0).execute: executing currentNodeId=Activity_1jg0x3o',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).execute: item=110d92bd-464a-422d-94e1-9d1fca4c7654',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).execute: execute enter ...',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).doEvent: executing script for event:enter',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).enter: item=110d92bd-464a-422d-94e1-9d1fca4c7654',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).execute: execute start ...',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).doEvent: executing script for event:start',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).start: item=110d92bd-464a-422d-94e1-9d1fca4c7654',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).startBoundaryEvents: itemId=110d92bd-464a-422d-94e1-9d1fca4c7654',
          'Node((1.1) Scelta Categoria|Activity_1jg0x3o).doEvent: executing script for event:wait',
          'Token(0).execute: executing currentNodeId=Activity_1jg0x3o itemId=110d92bd-464a-422d-94e1-9d1fca4c7654 is done!',
          'Token(0).goNext(): is done currentNodeId=Activity_1jg0x3o',
          '.execute returned',
          '.Execution Report ----',
          '..Status:running',
          '..token: 0 - wait - Primary current: Activity_1jg0x3o from root child of - {"tenantId":1,"startProcessUserId":10}',
          '..Item:0 -T# 0 StartEvent_1 Type: bpmn:StartEvent status: end  from 2023-03-30T20:28:26.069Z to 2023-03-30T20:28:26.069Z id: 3d36d0ac-fe3c-437d-a8a3-849b415636a0',
          '..Item:1 -T# 0 Flow_0snq4em Type: bpmn:SequenceFlow status: end',
          '..Item:2 -T# 0 Activity_1jg0x3o Type: bpmn:UserTask status: wait  from 2023-03-30T20:28:26.070Z to - id: 110d92bd-464a-422d-94e1-9d1fca4c7654',
          '.data:',
          '{"tenantId":1,"startProcessUserId":10}',
          '..Saving instance a0865bf2-0048-4206-9758-05d1a743b5ac'
        ],
        tokens: [ [Object] ],
        loops: [],
        involvements: [],
        authorizations: [],
        id: 'a0865bf2-0048-4206-9758-05d1a743b5ac',
        name: 'fbk-sd-mnf_NC-main_rev1',
        source: '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_17j9glj" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.7.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.2.0">\n' +
          '  <bpmn:collaboration id="Collaboration_0h839t4">\n' +
          '    <bpmn:participant id="Participant_067pj9o" name="FBK-SD-MNF" processRef="Process_07ii97u" />\n' +
          '  </bpmn:collaboration>\n' +
          '  <bpmn:process id="Process_07ii97u" isExecutable="true">\n' +
          '    <bpmn:extensionElements>\n' +
          '      <zeebe:userTaskForm id="userTaskForm_08ui781">{\n' +
          ........
          .......
          '    {\n' +
          '      "text": "v.20230220",\n' +
          '      "type": "text",\n' +
          '      "id": "Field_0vvb6m5"\n' +
          '    }\n' +
          '  ],\n' +
          '  "type": "default",\n' +
          '  "id": '... 123511 more characters,
        status: 'running',
        data: { tenantId: 1, startProcessUserId: 10 },
        startedAt: '2023-03-30T20:28:26.067Z',
        saved: '2023-03-30T20:28:26.073Z'
      },
      definition: Definition {
        processes: Map(1) { 'Process_07ii97u' => [Process] },
        nodes: Map(141) {
          'DataObjectReference_0t8pzni' => [Node],
          'DataObject_0ztvboo' => [Node],
          'Activity_0vk7m7z' => [UserTask],
          'Activity_0t0360p' => [UserTask],
          'Activity_1n1utam' => [UserTask],
          'Gateway_0eg8dyw' => [XORGateway],
          'Event_0bl5p7y' => [EndEvent],
          'Activity_0sfnaql' => [UserTask],
          'Gateway_0ev27l0' => [XORGateway],
          'Activity_1nyk7wm' => [UserTask],
          'POST_equipments_nonconformity-has-task-notes_9.1' => [Node],
          'POST_equipments_nonconformity-has-task-notes_10.1' => [Node],
          'POST_equipments_nonconformity-has-task-notes_12.1' => [Node],
          'Activity_1jg0x3o' => [UserTask],
          'Gateway_1vm4mvs' => [XORGateway],
          'Gateway_0li3etz' => [XORGateway],
          'Activity_1ypigus' => [UserTask],
          'Activity_0rqre4n' => [UserTask],
          'Activity_0z6wqbj' => [UserTask],
          'POST_equipments_nonconformity-has-task-notes_11.1' => [Node],
          'Gateway_08ihc4x' => [XORGateway],
          'Gateway_05x6a02' => [XORGateway],
          'processes_processes_id-name_name' => [Node],
          'Activity_0ppx8cu' => [UserTask],
          'Activity_0g4i5d4' => [UserTask],
          'Gateway_1o3an8m' => [XORGateway],
          'Activity_05v3y1m' => [UserTask],
          'Gateway_1e6qtao' => [XORGateway],
          'DataObjectReference_060eutf' => [Node],
          'DataObject_1uwyll9' => [Node],
          'Gateway_0iodqqg' => [XORGateway],
          'Activity_1d5uewo' => [UserTask],
          'POST_equipments_nonconformity-has-task-notes_3.1' => [Node],
          'POST_equipments_nonconformity-has-task-notes_4.1' => [Node],
          'DataObjectReference_1qmqc23' => [Node],
          'DataObject_12c6gcf' => [Node],
          'DataObjectReference_1l1f77e' => [Node],
          'DataObject_155qeei' => [Node],
          'POST_equipments_nonconformity-has-task-notes_6.2' => [Node],
          'POST_equipments_nonconformity-has-task-notes_6.1' => [Node],
          'equipments_nonconformity-statuses' => [Node],
          'equipments_nonconformity-priorities' => [Node],
          'equipments_nonconformity-categories' => [Node],
          'DataObjectReference_1rylbjf' => [Node],
          'DataObject_1maj5tj' => [Node],
          'DataObjectReference_0zfu77n' => [Node],
          'DataObject_0i7e0h1' => [Node],
          'DataObjectReference_014oylk' => [Node],
          'DataObject_0twjxc2' => [Node],
          'DataObjectReference_18tj689' => [Node],
          'DataObject_1jsdmpa' => [Node],
          'POST_equipments_nonconformity-has-task-notes_7.1' => [Node],
          'Gateway_0frbdns' => [XORGateway],
          'Gateway_1ixnfz8' => [XORGateway],
          'POST_equipments_nonconformity-has-task-notes_11.2' => [Node],
          'DataObjectReference_0el54sp' => [Node],
          'DataObject_0g8837d' => [Node],
          'POST_equipments_nonconformity-has-task-notes_8.1' => [Node],
          'DataObjectReference_0fa8kbi' => [Node],
          'DataObject_0g82sru' => [Node],
          'Activity_0mk5dg4' => [UserTask],
          'equipments_equipments_id-name_name' => [Node],
          'Activity_1b7e5gc' => [UserTask],
          'POST_equipments_nonconformities' => [Node],
          'Activity_0szqwt9' => [UserTask],
          'DataObjectReference_0rmpb9n' => [Node],
          'DataObject_07ksqp2' => [Node],
          'StartEvent_1' => [StartEvent],
          'DataObjectReference_0g8errr' => [Node],
          'DataObject_1ef753z' => [Node],
          'PATCH_equipments_nonconformities_13.1' => [Node],
          'Gateway_0uiyzhy' => [XORGateway],
          'Gateway_0xrusfm' => [XORGateway],
          'Activity_1r4blk2' => [UserTask],
          'DataObjectReference_0lcpmcv' => [Node],
          'DataObject_1qpd3x1' => [Node],
          'POST_equipments_nonconformity-has-task-notes_4.2' => [Node],
          'Flow_1ys4ljz' => [Node],
          'Flow_15hxrws' => [Node],
          .......
          .......
          'Flow_01azida' => [Node],
          'Flow_0zbo6qk' => [Node],
          'Flow_196f2ic' => [Node],
          'Flow_0vpks4s' => [Node],
          'DataObjectReference_1rcshi5' => [Node],
          'DataObject_0rsf50d' => [Node],
          'Flow_0zmv32q' => [Node],
          'Activity_1ic0kr7' => [UserTask],
          'POST_equipments_nonconformity-has-task-notes_5.1' => [Node],
          'DataObjectReference_1jjbfnk' => [Node],
          'DataObject_0kvoqd7' => [Node],
          'Activity_1vm79yv' => [UserTask],
          'appusers_users_id-firstname-lastname_firstname_5.1' => [Node],
          'Flow_0n4yzp2' => [Node],
          'Flow_0kaiyl6' => [Node],
          'Gateway_0xi0bzj' => [XORGateway],
          'Gateway_1vy2ywe' => [XORGateway],
          'Gateway_1ernv9a' => [XORGateway],
          'Activity_1db81yb' => [UserTask],
          'POST_equipments_nonconformity-has-task-notes_5.0' => [Node],
          'DataObjectReference_00u5hf5' => [Node],
          'DataObject_0akguhp' => [Node]
        },
        flows: [
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow], [Flow],
          [Flow], [Flow], [Flow], [Flow]
        ],
        accessRules: [],
        server: <ref *1> BPMNServer {
          listener: [EventEmitter],
          logger: [Logger],
          configuration: [Configuration],
          cron: [Cron],
          cache: [CacheManager],
          engine: [Engine],
          dataStore: [CustomDataStore],
          definitions: [CustomModelsDatastore],
          appDelegate: [MyAppDelegate],
          acl: [ACL],
          iam: [IAM]
        },
        name: 'fbk-sd-mnf_NC-main_rev1',
        source: '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_17j9glj" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.7.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.2.0">\n' +
          '  <bpmn:collaboration id="Collaboration_0h839t4">\n' +
          ......
          '    {\n' +
          '      "text": "v.20230220",\n' +
          '      "type": "text",\n' +
          '      "id": "Field_0vvb6m5"\n' +
          '    }\n' +
          '  ],\n' +
          '  "type": "default",\n' +
          '  "id": '... 123511 more characters,
        logger: Logger {
          debugMsgs: [Array],
          toConsole: false,
          toFile: '',
          callback: null
        },
        moddle: Moddle {
          properties: [Properties],
          factory: [Factory],
          registry: [Registry],
          typeCache: [Object]
        }
      },
      worker: Promise { undefined },
      process: Process {
        id: 'Process_07ii97u',
        isExecutable: true,
        name: 'fbk-sd-mnf_NC-main_rev1',
        def: Base {
          '$type': [Getter],
          id: 'Process_07ii97u',
          isExecutable: true,
          extensionElements: [Base],
          laneSets: [Array],
          flowElements: [Array],
          artifacts: [Array]
        },
        parent: null,
        childrenNodes: [
          [Node],       [Node],       [UserTask],   [UserTask],   [UserTask],
          [XORGateway], [EndEvent],   [UserTask],   [XORGateway], [UserTask],
          [Node],       [Node],       [Node],       [UserTask],   [XORGateway],
          [XORGateway], [UserTask],   [UserTask],   [UserTask],   [Node],
          [XORGateway], [XORGateway], [Node],       [UserTask],   [UserTask],
          [XORGateway], [UserTask],   [XORGateway], [Node],       [Node],
          [XORGateway], [UserTask],   [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [XORGateway], [XORGateway], [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [UserTask],   [Node],       [UserTask],   [Node],       [UserTask],
          [Node],       [Node],       [StartEvent], [Node],       [Node],
          [Node],       [XORGateway], [XORGateway], [UserTask],   [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          [Node],       [Node],       [Node],       [Node],       [Node],
          ... 41 more items
        ],
        eventSubProcesses: [],
        subProcessEvents: []
      },
      item: Item {
        _endedAt: null,
        assignments: [],
        authorizations: [],
        notifications: [],
        _dbAction: 'add',
        id: '110d92bd-464a-422d-94e1-9d1fca4c7654',
        seq: 2,
        element: UserTask {
          behaviours: Map(0) {},
          isFlow: false,
          scripts: Map(0) {},
          id: 'Activity_1jg0x3o',
          process: [Process],
          type: 'bpmn:UserTask',
          def: [Base],
          inbounds: [Array],
          outbounds: [Array],
          name: '(1.1) Scelta Categoria',
          attachments: []
        },
        token: Token {
          execution: [Circular *2],
          type: 'Primary',
          dataPath: '',
          startNodeId: 'StartEvent_1',
          currentNode: [UserTask],
          parentToken: null,
          originItem: null,
          id: 0,
          processId: 'Process_07ii97u',
          path: [Array],
          loop: null,
          status: 'wait'
        },
        _status: 'wait',
        startedAt: '2023-03-30T20:28:26.070Z'
      }
    }
    */

    /// https://github.com/ralphhanna/bpmn-server/blob/master/docs/examples.md#invoking-proccess-through-api
    // get waiting task
    const processDefinition = startEngineResult.definition;
    //console.log('BpmnEngineService.startProcess: processDefinition=', processDefinition);

    const populateTableUserTasks = false;
    if (populateTableUserTasks) {

      // ----------------------------------------------------------------------------------------------
      // Populate BpmnProcessInstanceHasUserTask
      // ----------------------------------------------------------------------------------------------
      //-----------------------------------------------------------
      //Get tenantId from inputData
      // input: { tenantId: 1, startProcessUserId: 10 },
      //-----------------------------------------------------------
      const currentTenantId = processInstance.data.tenantId;
      debug('BpmnEngineService.startProcess: currentTenantId=', currentTenantId);

      const processInstanceId = processInstance.id;
      debug('BpmnEngineService.startProcess: processInstanceId=', processInstanceId);



      debug('BpmnEngineService.startProcess: Populating BpmnProcessInstanceHasUserTask .....');


      // -------------------------------------------------------------------------
      // get  bpmn xml model
      // -------------------------------------------------------------------------
      try {
        const moddle = new BpmnModdle({camunda: camundaModdle});
        const {rootElement: definitions} = await moddle.fromXML(processInstance.source);
        debug('BpmnEngineService.startProcess: reading source......');
        debug('BpmnEngineService.startProcess: definitions=', definitions);
        //const processElement = definitions.rootElements[1];
        let processElement = undefined;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < definitions.rootElements.length; index++) {
          const element = definitions.rootElements[index];
          const elementType = element.$type;
          if (elementType === 'bpmn:Process') {
            processElement = element;
          }
        }
        //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: processElement=', processElement);
        if (processElement) {
          debug('BpmnEngineService.startProcess: found Process node; searching laneSets......');
          const lanesets = processElement.laneSets;
          debug('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets=', lanesets);

          // ---------------------------------------------------------------------
          // get  nodes
          /*
          nodes: Map(141) {
            'DataObjectReference_0t8pzni' => Node {
              behaviours: Map(0) {},
              isFlow: false,
              scripts: Map(0) {},
              id: 'DataObjectReference_0t8pzni',
              process: [Process],
              type: 'bpmn:DataObjectReference',
              def: [Base],
              inbounds: [],
              outbounds: [],
              name: 'correctiveActionIsSuccesful',
              attachments: []
            },
            'DataObject_0ztvboo' => Node {
              behaviours: Map(0) {},
              isFlow: false,
              scripts: Map(0) {},
              id: 'DataObject_0ztvboo',
              process: [Process],
              type: 'bpmn:DataObject',
              def: [Base],
              inbounds: [],
              outbounds: [],
              name: undefined,
              attachments: []
            },
            'Activity_0vk7m7z' => UserTask {
              behaviours: Map(0) {},
              isFlow: false,
              scripts: Map(0) {},
              id: 'Activity_0vk7m7z',
              process: [Process],
              type: 'bpmn:UserTask',
              def: [Base],
              inbounds: [Array],
              outbounds: [Array],
              name: '(9.1) Analisi Cause per Scegliere Azione Correttiva',
              attachments: []
            },
            */

          // ---------------------------------------------------------------------






          /*
          const bpmnProcessInstanceItemArray: any = processInstance.items;
          debug('BpmnEngineService.startProcess: looping on each items ...... bpmnProcessInstanceItemArray.lenght=', bpmnProcessInstanceItemArray.lenght);
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let indexItem = 0; indexItem < bpmnProcessInstanceItemArray.length; indexItem++) {
            const item = bpmnProcessInstanceItemArray[indexItem];
          */
          debug('BpmnEngineService.startProcess: looping on each node ...... processDefinition.nodes.size=', processDefinition.nodes.size);
          for (const [key, nodeValue] of processDefinition.nodes) {
            //console.log(key, nodeValue);
            //debug('BpmnEngineService.startProcess: nodeValue=', nodeValue);
            if (nodeValue.type === 'bpmn:UserTask') {
              debug('BpmnEngineService.startProcess: found bpmn:UserTask nodeValue.name=', nodeValue.name);
              /*
              const exampleWaitingItem = {
                id: 'fb0f2cf6-4c6b-4156-bfeb-1e4461acad82',
                seq: 25,
                tokenId: 0,
                elementId: 'Activity_1r4blk2',
                name: '(4.2) Verifica se posso eseguirla di nuovo',
                status: 'wait',
                startedAt: '2023-03-21T11:42:53.684Z',
                endedAt: null,
                type: 'bpmn:UserTask',
                assignments: [],
                authorizations: [],
                notifications: []
              }
              'Activity_0vk7m7z' => UserTask {
              behaviours: Map(0) {},
              isFlow: false,
              scripts: Map(0) {},
              id: 'Activity_0vk7m7z',
              process: [Process],
              type: 'bpmn:UserTask',
              def: [Base],
              inbounds: [Array],
              outbounds: [Array],
              name: '(9.1) Analisi Cause per Scegliere Azione Correttiva',
              attachments: []
            },
              */
              const taskId = nodeValue.id;  //****************** TODO */
              const taskElementId = nodeValue.id;
              const assignedUserRole = '';
              // -----------------------------------------------------------------
              // Search Task lane
              // -----------------------------------------------------------------
              let userTaskLaneName = '';
              if (lanesets && lanesets.length > 0) {
                //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets[0].lanes=', lanesets[0].lanes);
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let indexLane = 0; indexLane < lanesets[0].lanes.length; indexLane++) {
                  const lane = lanesets[0].lanes[indexLane];
                  // flowNodeRef
                  //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities:  indexLane=' + indexLane + ' lane=', lane);
                  if (lane.flowNodeRef) {
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let indexFlowRef = 0; indexFlowRef < lane.flowNodeRef.length; indexFlowRef++) {
                      const flowNodeRefTask = lane.flowNodeRef[indexFlowRef];
                      if (flowNodeRefTask.id === taskElementId) {
                        userTaskLaneName = lane.name;
                      }
                    }
                  }
                }
              }
              debug('BpmnEngineService.startProcess: found userTaskLaneName=', userTaskLaneName);

              const theProcessInfo = '';
              /*
              let processName = processInstance.name;
              if (processInstance.nonconformityInfo) {
                theProcessInfo += processInstance.nonconformityInfo.name;
                processName = 'NC:';
              }
              else if (processInstance.data && processInstance.data.equipUserAccessRequest) {
                theProcessInfo += processInstance.data.equipUserAccessRequest.userFirstname + ' ' + processInstance.data.equipUserAccessRequest.userLastname;
              }

              const waitingBpmnActivity: WaitingBpmnActivity = {
                item: item,
                assignedUserRole: taskAssignedToRole,
                processName: processName,
                processCounter: processInstance.counter,
                processInfo: theProcessInfo,
                processData: processInstance.data
              }
              this.waitingBpmnActivities.push(waitingBpmnActivity);
              */
              // -----------------------------------------------------------------
              // create new records
              // -----------------------------------------------------------------
              const bpmnProcessInstanceHasUserTask: Omit<BpmnProcessInstanceHasUserTask, 'id'> = {
                tenantId: currentTenantId,
                bpmnProcessInstanceId: processInstance.id,
                taskId: taskId,
                taskElementId: taskElementId,
                bpmnProcessUserRoleName: userTaskLaneName,
              }
              debug('BpmnEngineService.startProcess: creating new record bpmnProcessInstanceHasUserTask:', bpmnProcessInstanceHasUserTask);

              const resulCreateRecord = await this.bpmnProcessInstanceHasUserTaskRepository.createNoTenantIdFilter(bpmnProcessInstanceHasUserTask);
              debug('BpmnEngineService.startProcess: resulCreateRecord=', resulCreateRecord);

            }
          }

          debug('BpmnEngineService.startProcess: looping on each node finished!');

        }

      } catch (err) {
        console.error('BpmnEngineService.getWaitingProcessInstanceUserTaskByUserId: error loading xml model ', err);
      }


    }


    debug('BpmnEngineService.startProcess: End');
    const resultStartProcess = {
      processInstanceId: processInstance ? processInstance.id : null
    }
    return resultStartProcess;
  }

  //==========================================================================================================================================
  // getWaitingProcessInstanceUserTasks
  //==========================================================================================================================================
  async getWaitingProcessInstanceUserTasks(): Promise<Partial<BpmnProcessUserTask>[]> {
    debug('BpmnEngineService.getWaitingProcessInstanceUserTasks: Start  ');

    const query = {status: 'running'}
    const instances = await this.bpmnServer.dataStore.findInstances(query, 'full');
    debug('BpmnEngineService.getWaitingProcessInstanceUserTasks: bpmnServer instances.length=', instances.length);

    const resultBpmnProcessUserTaskArray: Partial<BpmnProcessUserTask>[] = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < instances.length; index++) {
      const processInstance: BpmnProcessInstance = instances[index];
      debug('BpmnEngineService.getWaitingProcessInstanceUserTasks: name[#counter]=', processInstance.name, '[', processInstance.counter, ']');
      // ----------------------------------------------------------------------------------------------
      // get  bpmn xml model
      // ----------------------------------------------------------------------------------------------
      try {
        const moddle = new BpmnModdle({camunda: camundaModdle});
        const {rootElement: definitions} = await moddle.fromXML(processInstance.source);
        //debug('BpmnEngineService.getWaitingProcessInstanceUserTasks: definitions=', definitions);
        //const processElement = definitions.rootElements[1];
        let processElement = undefined;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexElement = 0; indexElement < definitions.rootElements.length; indexElement++) {
          const element = definitions.rootElements[indexElement];
          const elementType = element.$type;
          if (elementType === 'bpmn:Process') {
            processElement = element;
          }

        }
        //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: processElement=', processElement);

        if (!processElement) {
          continue;
        }

        const lanesets = processElement.laneSets;
        //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets=', lanesets);

        // ----------------------------------------------------------------------------------------------
        // get  items
        // ----------------------------------------------------------------------------------------------
        const bpmnProcessInstanceItemArray: any = processInstance.items;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexItem = 0; indexItem < bpmnProcessInstanceItemArray.length; indexItem++) {
          const item = bpmnProcessInstanceItemArray[indexItem];
          if (item.status === 'wait' && item.type === 'bpmn:UserTask') {
            //debug('BpmnEngineService.getWaitingProcessInstanceUserTasks: waiting item=', item);
            /*
            const exampleWaitingItem = {
              id: 'fb0f2cf6-4c6b-4156-bfeb-1e4461acad82',
              seq: 25,
              tokenId: 0,
              elementId: 'Activity_1r4blk2',
              name: '(4.2) Verifica se posso eseguirla di nuovo',
              status: 'wait',
              startedAt: '2023-03-21T11:42:53.684Z',
              endedAt: null,
              type: 'bpmn:UserTask',
              assignments: [],
              authorizations: [],
              notifications: []
            }
            */
            const taskId = item.elementId;
            const assignedUserRole = '';
            // -----------------------------------------------------------------
            // Search Task lane
            // -----------------------------------------------------------------
            let taskAssignedToRole = '';
            if (lanesets && lanesets.length > 0) {
              //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets[0].lanes=', lanesets[0].lanes);
              // eslint-disable-next-line @typescript-eslint/prefer-for-of
              for (let indexLane = 0; indexLane < lanesets[0].lanes.length; indexLane++) {
                const lane = lanesets[0].lanes[indexLane];
                // flowNodeRef
                //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities:  indexLane=' + indexLane + ' lane=', lane);
                if (lane.flowNodeRef) {
                  // eslint-disable-next-line @typescript-eslint/prefer-for-of
                  for (let indexFlowRef = 0; indexFlowRef < lane.flowNodeRef.length; indexFlowRef++) {
                    const flowNodeRefTask = lane.flowNodeRef[indexFlowRef];
                    if (flowNodeRefTask.id === taskId) {
                      taskAssignedToRole = lane.name;
                    }
                  }
                }
              }
            }

            const theProcessInfo = '';
            /*
            let processName = processInstance.name;
            if (processInstance.nonconformityInfo) {
              theProcessInfo += processInstance.nonconformityInfo.name;
              processName = 'NC:';
            }
            else if (processInstance.data && processInstance.data.equipUserAccessRequest) {
              theProcessInfo += processInstance.data.equipUserAccessRequest.userFirstname + ' ' + processInstance.data.equipUserAccessRequest.userLastname;
            }

            const waitingBpmnActivity: WaitingBpmnActivity = {
              item: item,
              assignedUserRole: taskAssignedToRole,
              processName: processName,
              processCounter: processInstance.counter,
              processInfo: theProcessInfo,
              processData: processInstance.data
            }
            this.waitingBpmnActivities.push(waitingBpmnActivity);
            */
            // -----------------------------------------------------------------
            // create bpmnProcessUserTask
            // -----------------------------------------------------------------
            const bpmnProcessUserTask: Partial<BpmnProcessUserTask> = {
              taskName: item.name,
              taskDescription: '',
              taskElementId: item.elementId,
              taskStartedAt: item.startedAt,
              taskAssignedRole: taskAssignedToRole,
              taskAssignationInfo: {},
              processInstance: {
                id: processInstance.id,
                name: processInstance.name,
                counter: processInstance.counter,
                status: processInstance.status,
                startedAt: processInstance.startedAt,
                endedAt: processInstance.endedAt,
                data: processInstance.data,
                source: processInstance.source
              },
              processInstanceItem: {
                id: item.id,
                name: item.name,
                status: item.status,
                startedAt: item.startedAt,
                elementId: item.elementId
              },
              /*
              toJSON: function (): Object {
                throw new Error('Function not implemented.');
              },
              toObject: function (options?: AnyObject): Object {
                throw new Error('Function not implemented.');
              }
              */
            }

            resultBpmnProcessUserTaskArray.push(bpmnProcessUserTask);
          }
        }

      } catch (err) {
        console.error('BpmnEngineService.getWaitingProcessInstanceUserTaskByUserId: error loading xml model ', err);
      }
    }

    return resultBpmnProcessUserTaskArray;
  }

  /**
   *
   * @param userId
   * @returns ActiveUserTask[]
   */
  /*
  async getWaitingProcessInstanceUserTaskByUserId(userId: number): Promise<ActiveUserTask[]> {
    debug('getWaitingProcessInstanceUserTaskByUserId: Start  userId=', userId);



    return resultActiveUserTaskArrayFiltered;
  }
  */

  //==========================================================================================================================================
  // getProcessInstanceUserTaskByElementId
  //==========================================================================================================================================
  async getProcessInstanceUserTaskByElementId(processInstanceId: string, elementId: string): Promise<Partial<BpmnProcessUserTask>> {
    debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: Start  processInstanceId=', processInstanceId, ' elementId=', elementId);

    const query = {status: 'running'}
    const instances = await this.bpmnServer.dataStore.findInstances(query, 'full');
    debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: bpmnServer instances.length=', instances.length);

    const resultBpmnProcessUserTask: Partial<BpmnProcessUserTask> = undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < instances.length; index++) {
      const processInstance: BpmnProcessInstance = instances[index];
      if (processInstance.id !== processInstanceId) {
        continue;
      }
      debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: name[#counter]=', processInstance.name, '[', processInstance.counter, ']');
      try {
        // ----------------------------------------------------------------------------------------------
        // get  bpmn xml model
        // ----------------------------------------------------------------------------------------------
        const moddle = new BpmnModdle({camunda: camundaModdle});
        const {rootElement: definitions} = await moddle.fromXML(processInstance.source);
        //debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: definitions=', definitions);
        //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: definitions=', definitions);
        //const processElement = definitions.rootElements[1];
        let processElement = undefined;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexRootElement = 0; indexRootElement < definitions.rootElements.length; indexRootElement++) {
          const element = definitions.rootElements[indexRootElement];
          const elementType = element.$type;
          if (elementType === 'bpmn:Process') {
            processElement = element;
          }

        }
        //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: processElement=', processElement);

        //console.log('BpmnEngineService.getProcessInstanceUserTaskByElementId: processElement=', processElement);
        if (processElement) {
          debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: found Process node; searching laneSets......');
          const lanesets = processElement.laneSets;
          debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: lanesets=', lanesets);

          /*
          //-------------------------------------------------------------------------------------------
          // GET current flowElement
          //-------------------------------------------------------------------------------------------
          const itemElementId = bpmnProcessInstanceItem.elementId;
          //console.log('UserTaskWidgetWithFormComponent.extractBpmnXmlModelDefinition: itemElementId=', itemElementId);
          let currentFlowElement = undefined;
          let processInstanceItemExtensionElements = undefined;
          for (let index = 0; index < flowElements.length; index++) {
            const flowElement = flowElements[index];
            if (flowElement.id === bpmnProcessInstanceItem.elementId) {
              //console.log('UserTaskWidgetWithFormComponent.extractBpmnXmlModelDefinition: current flowElement=', flowElement);
              currentFlowElement = flowElement;
              processInstanceItemExtensionElements = flowElement.extensionElements;
            }
          }
          */

          // ---------------------------------------------------------------------
          // get  nodes
          // ---------------------------------------------------------------------
          const flowElements = processElement.flowElements;
          //debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: flowElements=', flowElements);


          debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: looping on each node ...... definitions.nodes=', flowElements.length);
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let indexFlowElement = 0; indexFlowElement < flowElements.length; indexFlowElement++) {
            const flowElement = flowElements[indexFlowElement];
            /*
            {
              '$type': [Getter],
              id: 'Activity_1ic0kr7',
              name: '(7.1) Verifica Correzione Assegnata',
              extensionElements: Base { '$type': [Getter], values: [ [Object], [Object] ] },
              dataOutputAssociations: [
                Base { '$type': [Getter], id: 'DataOutputAssociation_1dafajq' },
                Base { '$type': [Getter], id: 'DataOutputAssociation_18lw2u8' }
              ]
            }
            */
            debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: flowElement.name=', flowElement.name, ' id=', flowElement.id, ' type=', flowElement.$type);

            if (flowElement.$type === 'bpmn:UserTask' && flowElement.id === elementId) {
              debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: found bpmn:UserTask flowElement.name=', flowElement.name);
              /*
              'Activity_0vk7m7z' => UserTask {
              behaviours: Map(0) {},
              isFlow: false,
              scripts: Map(0) {},
              id: 'Activity_0vk7m7z',
              process: [Process],
              type: 'bpmn:UserTask',
              def: [Base],
              inbounds: [Array],
              outbounds: [Array],
              name: '(9.1) Analisi Cause per Scegliere Azione Correttiva',
              attachments: []
            },
              */
              //const taskId = nodeValue.id;  //****************** TODO */
              //const taskElementId = nodeValue.id;



              //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets=', lanesets);

              debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: searching taskAssignedToRole ....');

              // -----------------------------------------------------------------
              // Search Task lane
              // -----------------------------------------------------------------
              let taskAssignedToRole = '';
              const taskId = flowElement.id;
              if (lanesets && lanesets.length > 0) {
                //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities: lanesets[0].lanes=', lanesets[0].lanes);
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let indexLane = 0; indexLane < lanesets[0].lanes.length; indexLane++) {
                  const lane = lanesets[0].lanes[indexLane];
                  // flowNodeRef
                  //console.log('BpmnProcessTaskCurrentUserWidgetComponent.getWaitingBpmnActivities:  indexLane=' + indexLane + ' lane=', lane);
                  if (lane.flowNodeRef) {
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let indexFlowRef = 0; indexFlowRef < lane.flowNodeRef.length; indexFlowRef++) {
                      const flowNodeRefTask = lane.flowNodeRef[indexFlowRef];
                      if (flowNodeRefTask.id === taskId) {
                        taskAssignedToRole = lane.name;
                      }
                    }
                  }
                }
              }
              debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: taskAssignedToRole=', taskAssignedToRole);

              // -----------------------------------------------------------------
              // get activeUserTask
              // -----------------------------------------------------------------
              /*
              resultActiveUserTask = {
                processInstanceId: processInstance.id,
                processInstanceName: processInstance.name,
                processInstanceCounter: processInstance.counter,
                processInstanceData: processInstance.data,
                processInstanceStatus: processInstance.status,
                processInstanceStartedAt: processInstance.startedAt,
                processInstanceEndedAt: processInstance.endedAt,
                processInstanceItemId: null,

              }
              */
              // -----------------------------------------------------------------
              // create bpmnProcessUserTask
              // -----------------------------------------------------------------
              const resultActiveUserTask: Partial<BpmnProcessUserTask> = {
                taskName: flowElement.name,
                taskDescription: '',
                taskElementId: flowElement.elementId,
                taskStartedAt: null,
                taskAssignedRole: taskAssignedToRole,
                taskAssignationInfo: {},
                processInstance: {
                  id: processInstance.id,
                  name: processInstance.name,
                  counter: processInstance.counter,
                  status: processInstance.status,
                  startedAt: processInstance.startedAt,
                  endedAt: processInstance.endedAt,
                  data: processInstance.data
                },
                processInstanceItem: null,
                /*
                toJSON: function (): Object {
                  throw new Error('Function not implemented.');
                },
                toObject: function (options?: AnyObject): Object {
                  throw new Error('Function not implemented.');
                }
                */
              }

              debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: resultActiveUserTask=', resultActiveUserTask);
              return resultActiveUserTask;
            }
          }
        }

      } catch (err) {
        console.error('BpmnEngineService.getProcessInstanceUserTaskByElementId: error ', err);
      }
    }

    debug('BpmnEngineService.getProcessInstanceUserTaskByElementId: End  resultActiveUserTask=', resultBpmnProcessUserTask);
    return resultBpmnProcessUserTask;
  }

  //==========================================================================================================================================
  // invokeProcessInstanceItem
  //==========================================================================================================================================
  async invokeProcessInstanceItem(processInstanceItemId: string, data: object | undefined): Promise<boolean> {
    debug('BpmnEngineService.invokeProcessInstanceItem: Start');
    const invokeItemResult = await this.bpmnServer.engine.invoke({"items.id": processInstanceItemId}, data);
    //debug('BpmnEngineService.invokeProcessInstanceItem: invokeItemResult=', invokeItemResult);
    debug('BpmnEngineService.invokeProcessInstanceItem: End');
    return true;
  }


  //==========================================================================================================================================
  // getFields
  //==========================================================================================================================================
  async getFields(processName, elementId) {
    debug('BpmnEngineService.getFields: Start');
    const definition = await this.bpmnServer.definitions.load(processName);
    const node = definition.getNodeById(elementId);
    const extName = Behaviour_names.CamundaFormData;
    const ext = node.getBehaviour(extName);
    if (ext) {
      debug('BpmnEngineService.getFields: fields=', ext.fields);
      return ext.fields;
    }
    else
      return null;
  }


}
