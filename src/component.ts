import {
  Application, Component,
  config,
  ContextTags,
  CoreBindings,
  createServiceBinding,
  inject, injectable
} from '@loopback/core';
import {BPMNServer} from 'bpmn-server';
import {BpmnProcessInstanceController, BpmnProcessModelController, BpmnProcessUserRoleController, BpmnProcessUserRoleHasBpmnProcessModelController, BpmnProcessUserRoleHasUserController} from './controllers';
import {Loopback4BpmnServerComponentBindings} from './keys';
import {configuration} from './libraries/bpmn-server/configuration';
import {BpmnProcessInstance, BpmnProcessModel, BpmnProcessUserRole, BpmnProcessUserRoleHasBpmnProcessModel, BpmnProcessUserRoleHasUser} from './models';
import {BpmnServerObserver} from './observers';
import {BpmnProcessInstanceRepository, BpmnProcessModelRepository, BpmnProcessUserRoleHasBpmnProcessModelRepository, BpmnProcessUserRoleHasUserRepository, BpmnProcessUserRoleRepository} from './repositories';
import {BpmnServerEngineService} from './services';
import {DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS, Loopback4BpmnServerComponentOptions} from './types';
const debug = require('debug')('loopback:bpmn-server');

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
const pkg: PackageInfo = require('../package.json');
const COMPONENT_VERSION = pkg.version;

// Configure the binding for Loopback4BpmnServerComponent
@injectable({tags: {[ContextTags.KEY]: Loopback4BpmnServerComponentBindings.COMPONENT}})
export class Loopback4BpmnServerComponent implements Component {
  public bpmnServer: BPMNServer;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    public options: Loopback4BpmnServerComponentOptions = DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS,
  ) {
    console.log('Loopback4BpmnServerComponent version:', Loopback4BpmnServerComponent.getVersion());
    debug('Loopback4BpmnServerComponent version:', Loopback4BpmnServerComponent.getVersion());


    configuration.definitionsPath = options.bpmnProcessDefinitionDirectory;
    console.log('Loopback4BpmnServerComponent:   options.configuration.definitionsPath=', configuration.definitionsPath);

  }

  /*
  Observers
*/
  lifeCycleObservers = [BpmnServerObserver];


  /*
    Services
  */
  bindings = [
    createServiceBinding(BpmnServerEngineService)
  ];

  /*
    repositories
  */
  repositories = [
    BpmnProcessInstanceRepository,
    BpmnProcessModelRepository,
    BpmnProcessUserRoleRepository,
    BpmnProcessUserRoleHasUserRepository,
    BpmnProcessUserRoleHasBpmnProcessModelRepository
  ];

  /*
  models
  */
  models = [
    BpmnProcessInstance,
    BpmnProcessModel,
    BpmnProcessUserRole,
    BpmnProcessUserRoleHasUser,
    BpmnProcessUserRoleHasBpmnProcessModel
  ];

  /*
  controllers
  */
  controllers = [
    BpmnProcessInstanceController,
    BpmnProcessModelController,
    BpmnProcessUserRoleController,
    BpmnProcessUserRoleHasUserController,
    BpmnProcessUserRoleHasBpmnProcessModelController
  ];

  static getVersion() {

    return COMPONENT_VERSION;

  }
}
