# loopback4-bpmn-server

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install Loopback4BpmnServerComponent using local package

In the package.json add:

    "loopback4-tenant-table-filter": "file:loopback4-tenant-table-filter-1.0.5.tgz",
    "bpmn-server": "file:bpmn-server-1.3.12.tgz",
    "loopback4-bpmn-server": "file:loopback4-bpmn-server-0.96.1.tgz",

## Basic Use

Configure and load Loopback4BpmnServerComponent in the application constructor
as shown below.

```ts
import {Loopback4BpmnServerComponent, Loopback4BpmnServerComponentBindings, Loopback4BpmnServerComponentOptions} from 'loopback4-bpmn-server';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
  
  
    //--------------------------------------------------------------------------
    // BpmnServerComponent
    //--------------------------------------------------------------------------
    const definitionsPath = path.join(__dirname, '../processes/')
    console.log('AppServerApplication:startup: bpmnProcessDefinitionDirectory=', definitionsPath);
    const componentOptions: Loopback4BpmnServerComponentOptions = {
      bpmnProcessDefinitionDirectory: definitionsPath
    }
    this.configure(Loopback4BpmnServerComponentBindings.COMPONENT).to(componentOptions);
    this.component(Loopback4BpmnServerComponent);


    // ...
  }
  // ...
}
```
