import {DefaultAppDelegate, IExecution, Item} from 'bpmn-server/index';
const debug = require('debug')('loopback:bpmn-server:app-delegate');

const fs = require('fs');

let seq = 1;

class MyAppDelegate extends DefaultAppDelegate {
    constructor(server) {
        debug('MyAppDelegate.constructor: Starting...');
        super(server);
        this.servicesProvider = new MyServices();
    }
    sendEmail(to, msg, body) {

        console.log(`Sending email to ${to}`);

        const key = process.env.SENDGRID_API_KEY;

        if (key && (key !== '')) {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            const email = {
                to: to,
                from: 'ralphhanna@hotmail.com', // Change to your verified sender
                subject: msg,
                text: body,
                html: body
            }

            sgMail
                .send(email)
                .then((response) => {
                    this.server.logger.log('responseCode', response[0].statusCode)
                    this.server.logger.log('responseHeaders', response[0].headers)
                })
                .catch((error) => {
                    console.error('Email Error:' + error)
                })

        }
        else {
            console.log(`email is disabled`);
        }

    }

    async executionStarted(execution: IExecution) {
        await super.executionStarted(execution);
    }

    async executionEvent(context, event) {

        if (context.item) {

            //            console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
            if (event === 'wait' && context.item.element.type === 'bpmn:UserTask')
                console.log(`----->Waiting for User Input for '${context.item.element.id}' id: ${context.item.id}`);
        }
        //       else
        //           console.log('----->All:' + event, context.definition.name);


    }
    async messageThrown(messageId, data, matchingQuery, item: Item) {
        await super.messageThrown(messageId, data, matchingQuery, item);
    }
    async signalThrown(signalId, data, matchingQuery, item: Item) {
        await super.signalThrown(signalId, data, matchingQuery, item);
    }
    async serviceCalled(input, context) {
        this.server.logger.log("service called");

    }

    //--------------------------------------------------------------------------
    // Metodi per script evaluation
    //--------------------------------------------------------------------------
    scopeEval(scope, script: string) {
        debug('MyAppDelegate.scopeEval: Starting... scope=', scope, ' script=', script);

        let result;
        // remove the = from the init of the script
        // https://docs.camunda.io/docs/components/concepts/expressions/#expressions-vs-static-values
        let scriptModif1;
        if (script.startsWith("=")) {
            scriptModif1 = script.substring(1);
        } else {
            scriptModif1 = script;
        }
        // duplicate internal = in the script to permit use ELF espression
        debug('MyAppDelegate.scopeEval: step1 removed = from init; scriptModif1: ', scriptModif1);

        let scriptModif2;
        if (scriptModif1.indexOf("=")) {
            scriptModif2 = scriptModif1.replace("=", "==");
        }
        else {
            scriptModif2 = scriptModif1;
        }
        debug('MyAppDelegate.scopeEval: step2 duplicate = inside the script; scriptModif2: ', scriptModif2);

        try {
            const js = `
            var item=this;
            var data=this.data;
            var input=this.input;
            var output=this.output;
            return (${scriptModif2});`;
            debug('MyAppDelegate.scopeEval: js: ', js);
            result = Function(js).bind(scope)();
        }
        catch (exc) {
            console.log('error in script evaluation ', scriptModif2);
            console.log(exc);
        }
        return result;
    }
    async scopeJS(scope, script: string) {
        debug('MyAppDelegate.scopeJS: Starting... scope=', scope, ' script=', script);
        // remove the = from the script
        // https://docs.camunda.io/docs/components/concepts/expressions/#expressions-vs-static-values
        let scriptModif;
        if (script.startsWith("=")) {
            scriptModif = script.substring(1);
        } else {
            scriptModif = script;
        }
        debug('MyAppDelegate.scopeJS: scriptModif=', scriptModif);


        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        let result;
        try {
            const js = `
            var item=this;
            var data=this.data;
            var input=this.input;
            var output=this.output;
            ${scriptModif}`;
            result = await new AsyncFunction(js).bind(scope)();
            scope.token.log("..executing js is done " + scope.id);
        }
        catch (exc) {
            scope.token.log("ERROR in executing Script " + exc.message + "\n" + scriptModif);
            console.log('error in script execution ', scriptModif);
            console.log(exc);
        }
        return result;

    }


}

async function delay(time, result) {
    console.log("delaying ... " + time)
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log("delayed is done.");
            resolve(result);
        }, time);
    });
}
class MyServices {

    async serviceTask(input, context) {
        const item = context.item;
        console.log(" Hi this is the serviceTask from appDelegate");
        console.log(item);
        await delay(5000, 'test');
        console.log(" Hi this is the serviceTask from appDelegate says bye");
    }
    async add({v1, v2}) {
        console.log("Add Service", v1, v2);

        return Number(v1) + Number(v2);
    }
    async service1(input, context) {
        const item = context.item;
        seq++;
        await delay(5000, 'test');
        item.token.log("SERVICE 1: input: " + input + item.token.currentNode.id + " current seq: " + seq);

        console.log('appDelegate service1 is now complete input:', input, 'output:', seq);
        return {seq, text: 'test'};
    }


    async startSeparateProcess(input, context) {
        console.log('MyAppDelegate.startSeparateProcess: Starting...');
        //debug('MyAppDelegate.startSeparateProcess: Starting...');
        // { processName: 'fbk-sd-mnf_NC-azioni-correttive_rev1' }
        console.log('MyAppDelegate.startSeparateProcess: input=', input);
        //console.log('MyAppDelegate.startSeparateProcess: context=', context);
        const item = context.item;
        /*
        item: Item {
            _endedAt: null,
            assignments: [],
            authorizations: [],
            notifications: [],
            input: { processName: 'fbk-sd-mnf_NC-azioni-correttive_rev1' },
            output: {},
            vars: {},
            _dbAction: 'add',
            id: 'b083614f-c514-4b6f-86b2-1294c3cf6b68',
            seq: 4,
            element: ServiceTask {
              behaviours: [Map],
              isFlow: false,
              scripts: Map(0) {},
              id: 'Activity_serviceTask',
              process: [Process],
              type: 'bpmn:ServiceTask',
              def: [Base],
              inbounds: [Array],
              outbounds: [Array],
              name: 'startSeparateProcessService',
              attachments: []
            },
            token: Token {
              execution: [Circular *2],
              type: 'Primary',
              dataPath: '',
              startNodeId: 'StartEvent_1',
              currentNode: [ServiceTask],
              parentToken: null,
              originItem: null,
              id: 0,
              processId: 'Process_0uzd73d',
              path: [Array],
              loop: null,
              status: 'wait'
            },
            _status: 'start',
            startedAt: '2023-09-27T18:40:51.441Z'
          },
        */
        console.log('MyAppDelegate.startSeparateProcess: context.item=', item);

        const currentContextInstanceData = context.instance.data;
        console.log('MyAppDelegate.startSeparateProcess: currentContextInstanceData=', currentContextInstanceData);
        // data: { tenantId: 1, startProcessUserId: 10 },

        //----------------------------------------------------------------------------------
        // Start Process
        //----------------------------------------------------------------------------------
        const newProcessInputData = {
            tenantId: currentContextInstanceData.tenantId,
            startProcessUserId: currentContextInstanceData.startProcessUserId
        }

        /*
        Object.keys(this.mainFormGroup.controls).forEach(key => {
            const formControl = this.mainFormGroup.controls[key];
            let value: any = formControl.value;
            controlsValue[key] = value;
          });
          */

        Object.entries(input).forEach(([key, value]) => {
            if (key !== 'processName') {
                console.log('MyAppDelegate.startSeparateProcess: input properties key=', key, ' value', value);
                newProcessInputData[key] = value;
            }
        }
        );
        console.log('MyAppDelegate.startSeparateProcess: newProcessInputData=', newProcessInputData);


        const processName = input.processName;
        const startEngineResult = await context.engine.start(processName, newProcessInputData);
        //console.log('MyAppDelegate.startSeparateProcess: startEngineResult=', startEngineResult);

        const newStartedProcessInstance = startEngineResult.instance;
        //console.log('MyAppDelegate.startSeparateProcess: processInstance=', processInstance);
        console.log('MyAppDelegate.startSeparateProcess: started process name=', newStartedProcessInstance.name, ' id=', newStartedProcessInstance.id);
        //console.log('MyAppDelegate.startSeparateProcess: started process items=', newStartedProcessInstance.items);
        //console.log('MyAppDelegate.startSeparateProcess: started process tokens=', newStartedProcessInstance.tokens);




        const resultService = {
            startedProcessInstanceId: newStartedProcessInstance.id,
            startedProcessInstanceName: newStartedProcessInstance.name
        }
        console.log('MyAppDelegate.startSeparateProcess: resultService=', resultService);
        return resultService;
    }

}
export {MyAppDelegate};

