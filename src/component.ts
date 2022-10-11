import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
} from '@loopback/core';
import {Loopback4BpmnServerComponentBindings} from './keys'
import {DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS, Loopback4BpmnServerComponentOptions} from './types';

// Configure the binding for Loopback4BpmnServerComponent
@injectable({tags: {[ContextTags.KEY]: Loopback4BpmnServerComponentBindings.COMPONENT}})
export class Loopback4BpmnServerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: Loopback4BpmnServerComponentOptions = DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS,
  ) {}
}
