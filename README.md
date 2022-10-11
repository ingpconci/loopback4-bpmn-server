# loopback4-bpmn-server

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install Loopback4BpmnServerComponent using `npm`;

```sh
$ [npm install | yarn add] loopback4-bpmn-server
```

## Basic Use

Configure and load Loopback4BpmnServerComponent in the application constructor
as shown below.

```ts
import {Loopback4BpmnServerComponent, Loopback4BpmnServerComponentOptions, DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS} from 'loopback4-bpmn-server';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: Loopback4BpmnServerComponentOptions = DEFAULT_LOOPBACK4_BPMN_SERVER_OPTIONS;
    this.configure(Loopback4BpmnServerComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(Loopback4BpmnServerComponent);
    // ...
  }
  // ...
}
```
