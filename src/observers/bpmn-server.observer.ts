import {
  Application,
  CoreBindings,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service
} from '@loopback/core';
import {BpmnServerEngineService} from '../services/bpmn-server-engine.service';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class BpmnServerObserver implements LifeCycleObserver {

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @service() public bpmnEngineService: BpmnServerEngineService
  ) {
    console.log('BpmnServerObserver.constructor: Starting...');
  }


  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
    console.log('BpmnServerObserver.init():');
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start
    console.log('BpmnServerObserver.start():');

    this.bpmnEngineService.startBpmnServer();
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
    console.log('BpmnServerObserver.stop():');
  }
}
