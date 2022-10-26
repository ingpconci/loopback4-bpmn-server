import { /* inject, */ BindingScope, ContextTags, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Behaviour_names, BPMNServer, Logger} from 'bpmn-server/dist/index';
import {Loopback4BpmnServerComponent} from '../component';
import {Loopback4BpmnServerComponentBindings} from '../keys';
import {configuration} from '../libraries/bpmn-server/configuration';
import {BpmnProcessInstanceRepository} from '../repositories/bpmn-process-instance.repository';
import {BpmnProcessModelRepository} from '../repositories/bpmn-process-model.repository';
const debug = require('debug')('loopback:bpmn-server:services:bpmn-engine');

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: Loopback4BpmnServerComponentBindings.BPMN_ENGINE_SERVICE}
})
export class BpmnServerEngineService {
  private bpmnServer: BPMNServer;

  constructor(
    @inject(Loopback4BpmnServerComponentBindings.COMPONENT) private component: Loopback4BpmnServerComponent,
    @repository(BpmnProcessInstanceRepository) public bpmnProcessInstanceRepository: BpmnProcessInstanceRepository,
    @repository(BpmnProcessModelRepository) public bpmnProcessModelRepository: BpmnProcessModelRepository
  ) {
    debug('BpmnEngineService.constructor: Starting...');
    this.bpmnServer = component.bpmnServer;
  }

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


  /**
   *
   * @param processName name of the process to start
   * @param inputData
   */
  async startProcess(processName: string, inputData: any): Promise<boolean> {
    debug('BpmnEngineService.startProcess: Start');
    const startEngineResult = await this.bpmnServer.engine.start(processName, inputData);
    //console.log('BpmnEngineService.startProcess: startEngineResult=', startEngineResult);

    debug('BpmnEngineService.startProcess: End');
    return true;
  }

  async invokeProcessInstanceItem(processInstanceItemId: string, data: object | undefined): Promise<boolean> {
    debug('BpmnEngineService.invokeProcessInstanceItem: Start');
    const invokeItemResult = await this.bpmnServer.engine.invoke({"items.id": processInstanceItemId}, data);
    debug('BpmnEngineService.invokeProcessInstanceItem: invokeItemResult=', invokeItemResult);
    debug('BpmnEngineService.invokeProcessInstanceItem: End');
    return true;
  }


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
