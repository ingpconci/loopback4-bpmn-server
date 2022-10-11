import {BindingKey, CoreBindings} from '@loopback/core';
import {Loopback4BpmnServerComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace Loopback4BpmnServerComponentBindings {
  export const COMPONENT = BindingKey.create<Loopback4BpmnServerComponent>(
    `${CoreBindings.COMPONENTS}.Loopback4BpmnServerComponent`,
  );
}
