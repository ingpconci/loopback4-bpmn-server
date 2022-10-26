/**
* Interface defining the component's options object
*/
export interface Loopback4BpmnServerComponentOptions {
  // Add the definitions here
  bpmnProcessDefinitionDirectory: string;
}

/**
* Default options for the component
*/
export const DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS: Loopback4BpmnServerComponentOptions = {
  // Specify the values here
  bpmnProcessDefinitionDirectory: ''
};
