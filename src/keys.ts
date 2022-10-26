import {BindingKey, CoreBindings} from '@loopback/core';
import {Loopback4BpmnServerComponent} from './component';
import {BpmnServerEngineService} from './services';

/**
 * Binding keys used by this component.
 */
export namespace Loopback4BpmnServerComponentBindings {
  export const COMPONENT = BindingKey.create<Loopback4BpmnServerComponent>(
    `${CoreBindings.COMPONENTS}.Loopback4BpmnServerComponent`,
  );
  export const BPMN_ENGINE_SERVICE = BindingKey.create<BpmnServerEngineService>(
    Loopback4BpmnServerComponentBindings.COMPONENT + '.BpmnEngineService',
  );

  export const BPMN_PROCESSES_PATH = BindingKey.create<string>(
    Loopback4BpmnServerComponentBindings.COMPONENT + '.BpmnProcessesPath',
  );
}
