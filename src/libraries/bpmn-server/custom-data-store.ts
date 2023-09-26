import {Filter} from '@loopback/repository';
import {Assignment, Authorization, Execution, IBPMNServer, IDataStore, IInstanceData, Involvement, Notification, ServerComponent} from 'bpmn-server/dist/index';
import {BpmnProcessInstance} from '../../models';

const debug = require('debug')('loopback:bpmn-server:custom-data-store');

// eslint-disable-next-line @typescript-eslint/naming-convention
const Instance_collection = 'wf_instances';
// eslint-disable-next-line @typescript-eslint/naming-convention
const Events_collection = 'wf_events';

class CustomDataStore extends ServerComponent implements IDataStore {
  dbConfiguration: any;
  db: any;
  execution: Execution;
  isModified = false;
  isRunning = false;
  inSaving = false;
  promises = [];

  constructor(server: IBPMNServer) {
    console.log('CustomDataStore.constructor: start');
    debug('constructor: Start');
    super(server);

    //this.dbConfiguration = this.configuration.database.MongoDB;
    //this.db = new MongoDB(this.dbConfiguration, this.logger);

    debug('constructor: End');
  }

  monitorExecution(execution: Execution): void {
    debug('monitorExecution: Start ');
    this.execution = execution;
    const listener = execution.listener;
    //throw new Error('Method not implemented.');
  }

  saveCounter = 0;
  async save(): Promise<void> {
    console.log('CustomDataStore.save()')
    debug('save(): Start ');
    if (this.inSaving) {
      // come back please
      this.saveCounter++;	/// will do it after I am done
      this.logger.log(" in saving take a number #" + this.saveCounter);
      return;
      //			await Promise.all(this.promises);
      //			this.inSaving = false;
    }
    let currentCounter = this.saveCounter;
    this.inSaving = true;
    if (this.isModified) {
      debug('save(): this.isModified==true');
      //			this.logger.log('CustomDataStore: saving ');
      //let state = await this.execution.getState();
      let state = this.execution.getState();
      if (state.saved !== this.execution.instance.saved) {
        console.log("********* ERROR OLD State****");
      }

      await this.saveInstance(state, this.execution.getItems())
      this.execution.instance.saved = new Date().toISOString();;
      //			this.logger.log('CustomDataStore: saved ' + this.execution.instance.saved);

      while (this.saveCounter > currentCounter) {	// will do it again
        this.logger.log('CustomDataStore:while i was busy other changes happended' + this.saveCounter);
        currentCounter = this.saveCounter;
        state = this.execution.getState();
        await this.saveInstance(state, this.execution.getItems())
        this.execution.instance.saved = new Date().toISOString();;
        this.logger.log('CustomDataStore: saved again ' + this.execution.instance.saved);

      }
      this.isModified = false;
      //			this.logger.log('CustomDataStore: save is now done ');
    }
    this.inSaving = false;
    //throw new Error('Method not implemented.');
  }

  async check(event, item) {
    console.log('CustomDataStore.check(): start');
    debug('check(): Start event=', event);
    if (item)
      this.logger.log('CustomDataStore: instance modified...event:' + event + 'item:' + item.elementId);
    else
      this.logger.log('CustomDataStore: instance modified...event:' + event);

    this.isModified = true;
    //setTimeout(this.save.bind(this), 500);
    return this.execution.promises.push(this.save());

  }


  async loadInstance(instanceId: any): Promise<{instance: any; items: any[];}> {
    console.log('CustomDataStore.loadInstance()')
    debug('loadInstance: Start ');
    const recs = await this.findInstances({id: instanceId}, 'full');
    if (recs.length == 0) {

      this.logger.error("Instance is not found for this item");
      return null;
    }
    const instanceData = recs[0];

    //		this.logger.log(" instance obj found" + instanceData.id);

    return {instance: instanceData, items: this.getItemsFromInstances([instanceData])};
    //throw new Error('Method not implemented.');
  }

  private getItemsFromInstances(instances, condition = null) {
    console.log('CustomDataStore.getItemsFromInstances()');
    debug('getItemsFromInstances: Start ');
    const items = [];
    instances.forEach(instance => {
      instance.items.forEach(i => {
        let pass = true;

        if (condition) {
          const keys = Object.keys(condition);
          keys.forEach(key => {
            if (i[key] != condition[key])
              pass = false;
          });
        }
        if (pass) {
          i['processName'] = instance.name;
          i['data'] = instance.data;
          i['instanceId'] = instance.id;
          items.push(i);
        }
      });
    });
    return items.sort(function (a, b) {return (a.seq - b.seq);});
  }

  // save instance to DB
  static seq = 0;
  private async saveInstance(instance, items) {
    //		this.logger.log("Saving...");
    console.log('CustomDataStore.saveInstance:');
    debug('saveInstance: instance.name=', instance.name);

    this.logger.log("Datastore.saveInstance: Saving...");
    this.logger.log("		instance=", instance);




    //var json = JSON.stringify(instance.state, null, 2);
    const tokensCount = instance.tokens.length;
    const itemsCount = instance.items.length;
    //		this.logger.log('saving instance ' + tokensCount + " tokens and items: " + itemsCount);
    this.logger.log('Datastore.saveInstance: saving instance ' + tokensCount + " tokens and items: " + itemsCount);


    let recs;
    debug('saveInstance:  instance.save=', instance.saved);
    if (!instance.saved) {
      instance.saved = new Date().toISOString();
      debug('saveInstance:  instance:', instance.name);
      debug('saveInstance:  instance.data=', instance.data);

      //this.promises.push(this.db.insert(this.dbConfiguration.db, Instance_collection, [instance]));
      //this.promises.push(this.db.insert(this.dbConfiguration.db, Instance_collection, [instance]));
      // OLD await this.db.insert(this.dbConfiguration.db, Instance_collection, [instance]);
      //-------------------------------------------
      // New instance
      //--------------------------------------------
      const bpmnProcessInstance: BpmnProcessInstance = new BpmnProcessInstance;
      bpmnProcessInstance.id = instance.id;
      bpmnProcessInstance.name = instance.name;
      bpmnProcessInstance.source = instance.source;
      bpmnProcessInstance.saved = instance.saved;
      bpmnProcessInstance.startedAt = instance.startedAt;
      bpmnProcessInstance.endedAt = instance.endedAt;
      bpmnProcessInstance.status = instance.status;
      bpmnProcessInstance.parentItemId = instance.parentItemId;
      bpmnProcessInstance.data = JSON.stringify(instance.data);
      bpmnProcessInstance.items = JSON.stringify(instance.items);
      const logsJsonArray = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < instance.logs.length; index++) {
        const logRowText = instance.logs[index];
        const logRowObj = {
          msg: logRowText
        }
        logsJsonArray.push(logRowObj);
      }
      //console.log('Datastore.saveInstance: instance.logs:', instance.logs);
      //console.log('Datastore.saveInstance: logsJsonArray:', logsJsonArray);
      bpmnProcessInstance.logs = JSON.stringify(logsJsonArray);//instance.logs;
      bpmnProcessInstance.tokens = JSON.stringify(instance.tokens);
      bpmnProcessInstance.loops = JSON.stringify(instance.loops);
      //console.log('Datastore.saveInstance: bpmnProcessInstance.name=', bpmnProcessInstance.name);
      debug('saveInstance: saving bpmnProcessInstance.name=', bpmnProcessInstance.name);

      //-----------------------------------------------------------
      //Get tenantId from inputData
      //-----------------------------------------------------------
      const currentTenantId = instance.data.tenantId;
      bpmnProcessInstance.tenantId = currentTenantId;

      const result = await this.server.configuration.database.loopbackRepositories.bpmnProcessInstanceRepository.createNoTenantIdFilter(bpmnProcessInstance);
      debug('saveInstance: new instance inserted! result=', result);

      //			this.logger.log("inserting instance");
    }
    else {
      //-------------------------------------------
      // Update instance
      //--------------------------------------------
      const bpmnProcessInstance: BpmnProcessInstance = new BpmnProcessInstance;
      bpmnProcessInstance.id = instance.id;
      bpmnProcessInstance.saved = instance.saved;
      bpmnProcessInstance.endedAt = instance.endedAt;
      bpmnProcessInstance.status = instance.status;
      bpmnProcessInstance.data = JSON.stringify(instance.data);
      bpmnProcessInstance.items = JSON.stringify(instance.items);
      bpmnProcessInstance.tokens = JSON.stringify(instance.tokens);
      bpmnProcessInstance.loops = JSON.stringify(instance.loops);
      const logsJsonArray = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < instance.logs.length; index++) {
        const logRowText = instance.logs[index];
        const logRowObj = {
          msg: logRowText
        }
        logsJsonArray.push(logRowObj);
      }
      bpmnProcessInstance.logs = JSON.stringify(logsJsonArray);
      //console.log('Datastore.saveInstance: updating bpmnProcessInstance.id=', bpmnProcessInstance.id);
      debug('Datastore.saveInstance: updating bpmnProcessInstance.id=', bpmnProcessInstance.id);

      //-----------------------------------------------------------
      //Get tenantId from inputData
      //-----------------------------------------------------------
      const currentTenantId = instance.data.tenantId;
      bpmnProcessInstance.tenantId = currentTenantId;

      const id = bpmnProcessInstance.id;
      const result = await this.server.configuration.database.loopbackRepositories.bpmnProcessInstanceRepository.updateByIdNoTenantIdFilter(id, bpmnProcessInstance);

      //console.log('Datastore.saveInstance: bpmnProcessInstance updated!');
      debug('Datastore.saveInstance: bpmnProcessInstance updated!');

      /*
      this.promises.push(this.db.update(this.dbConfiguration.db, Instance_collection,
        {id: instance.id},
        {
          $set:
          {
            tokens: instance.tokens, items: instance.items, loops: instance.loops,
            endedAt: instance.endedAt, status: instance.status, saved: instance.saved,
            logs: instance.logs, data: instance.data,
            involvements: instance.involvements,
            authorizations: instance.authorizations

          }
        }));
      */
      //  this.logger.log("updating instance");
    }
    /*t fileName = instance.name + '_' + CustomDataStore.seq++ + '.state';
    await fs.writeFile(fileName, JSON.stringify(instance), function (err) {
      if (err) throw err;
    });*/

    await Promise.all(this.promises);
    this.logger.log('..CustomDataStore:saving Complete');

  }

  async findItem(query: any): Promise<any> {
    const results = await this.findItems(query);
    if (results.length == 0)
      throw Error(" No items found for " + JSON.stringify(query));
    else if (results.length > 1)
      throw Error(" More than one record found " + results.length + JSON.stringify(query));
    else
      return results[0];
    //throw new Error('Method not implemented.');
  }

  async findInstance(query: any, options: any): Promise<IInstanceData> {
    const results = await this.findInstances(query, options);
    if (results.length == 0)
      throw Error(" No instance found for " + JSON.stringify(query));
    else if (results.length > 1)
      throw Error(" More than one record found " + results.length + JSON.stringify(query));

    const rec = results[0];

    this.convertColl(rec.authorizations, Authorization);
    this.convertColl(rec.involvements, Involvement);
    rec.items.forEach(item => {
      this.convertColl(item.authorizations, Authorization);
      this.convertColl(item.assignments, Assignment);
      this.convertColl(item.notifications, Notification);

    });
    return rec;

    //throw new Error('Method not implemented.');
  }

  convertObj(obj, cls) {
    return Object.assign(new cls, obj);

  }
  convertColl(coll, cls) {
    if (coll) {
      for (let i = 0; i < coll.length; i++) {
        const el = coll[i];
        coll[i] = Object.assign(new cls, el);
      }
    }

  }


  async findInstances(query, option: 'summary' | 'full' | any = 'summary'): Promise<any> {
    debug('findInstances: query=', query, ' option=', option);
    //instance.saved
    let projection;

    if (option == 'summary')
      projection = {source: 0, logs: 0};
    else
      projection = {};

    /* OLD
    const records = await this.db.find(this.dbConfiguration.db, Instance_collection, query, projection);
    */
    const records: any = [];
    //--------------------------------------------------------------------------
    // query
    //--------------------------------------------------------------------------
    let filterWhere: any;
    filterWhere = {
      and: []
    };

    //id
    const instanceId = query['id'];
    debug('findInstances: query instanceId=', instanceId);
    if (filterWhere && filterWhere.and && instanceId) {
      filterWhere.and.push(
        {
          id: {
            eq: instanceId
          }
        },
      )
    }
    //status
    const instanceStatus = query['status'];
    debug('findInstances: query instanceStatus=', instanceStatus);
    if (filterWhere && filterWhere.and && instanceStatus) {
      filterWhere.and.push(
        {
          status: {
            eq: instanceStatus
          }
        },
      )
    }
    const filterBpmnProcessInstance: Filter<BpmnProcessInstance> = {
      where: filterWhere
    }

    // fields
    const fields = {
      id: true,
      parentItemIs: true,
      name: true,
      status: true,
      startedAt: true,
      endedAt: true,
      saved: true,  //N.B. not savedAt
      source: true,
      items: true,
      data: true,
      tokens: true,
      loops: true,
      logs: true,
      counter: true,
      tenantIs: true,
      note: true
    };
    filterBpmnProcessInstance.fields = fields;

    // order
    filterBpmnProcessInstance.order = ['startedAt asc'];

    debug('findInstances: filterBpmnProcessInstance=', JSON.stringify(filterBpmnProcessInstance));

    //--------------------------------------------------------------------------
    // Find bpmnProcessInstances
    //--------------------------------------------------------------------------
    let bpmnProcessInstanceArray = undefined;

    try {
      debug('findInstances: get the instances from the DB.....');
      bpmnProcessInstanceArray = await this.server.configuration.database.loopbackRepositories.bpmnProcessInstanceRepository.findNoTenantIdFilter(filterBpmnProcessInstance);
      debug('findInstances: bpmnProcessInstanceArray.lenght=', bpmnProcessInstanceArray.length);

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < bpmnProcessInstanceArray.length; index++) {
        /*
        const bpmnProcessInstanceExample =
        {
          endedAt: null,
          id: "78a20be8-d9d8-4c04-9999-3893b8544bef",
          items: [
            {
              elementId: "StartEvent_1",
              endedAt: "2021-11-29T23:39:47.117Z",
              id: "01568114-d32b-43b1-bf5d-0237f0ae421a",
              name: "New Collaborator Arrived",
              seq: 0,
              startedAt: "2021-11-29T23:39:47.117Z",
              status: "end",
              tokenId: 0,
              type: "bpmn:StartEvent",
            },
            {
              elementId: "Flow_19jocqh",
              endedAt: null,
              id: "956a6539-068c-40f1-8506-4381d8ddbe26",
              seq: 1,
              status: "end",
              tokenId: 0,
              type: "bpmn:SequenceFlow",
            },
            {
              elementId: "Activity_0zler0n",
              endedAt: null,
              id: "987a4b7f-d2fb-41f5-a68a-3e6ff846c7f4",
              name: "Make a request for Facility Access",
              seq: 2,
              startedAt: "2021-11-29T23:39:47.124Z",
              status: "wait",
              tokenId: 0,
              type: "bpmn:UserTask"
            },
          ],
          name: "new-user-authorization",
          tokens: '[{"id":0,"type":"Primary","status":"wait","dataPath":"","startNodeId":"StartEvent_1","currentNode":"Activity_171c1lu"}]',
          loops: '[]',
          logs: [
            {msg: 'ACTION:execute:'},
            {msg: '..starting at :StartEvent_1'},
            {
              msg: '.executing item:StartEvent_1 01568114-d32b-43b1-bf5d-0237f0ae421a'
            },
            {msg: '..>enter StartEvent_1'},
            {msg: '..>start StartEvent_1'},
            {msg: '..>run StartEvent_1'},
            {msg: '..>end StartEvent_1'}
          ],
          startedAt: "2021-11-29T23:39:47.115Z",
          status: "running",
        }
        */

        const bpmnProcessInstance = bpmnProcessInstanceArray[index];
        debug('findInstances: bpmnProcessInstance.id=', bpmnProcessInstance.id);
        if (instanceId !== undefined && bpmnProcessInstance.id === instanceId) {
          //------------------------------------------------
          // normalize logs
          //------------------------------------------------
          const logsTextArray = [];
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let index = 0; index < bpmnProcessInstance.logs.length; index++) {
            const logRowObj = bpmnProcessInstance.logs[index];
            if (logRowObj.msg) {
              const logRowText = logRowObj.msg;
              logsTextArray.push(logRowText);
            } else if (logRowObj.msg && logRowObj.msg.msg) {
              const logRowText = logRowObj.msg.msg;
              logsTextArray.push(logRowText);
            }
          }
          bpmnProcessInstance.logs = logsTextArray;
          records.push(bpmnProcessInstance);
        }
        else {
          records.push(bpmnProcessInstance);
        }
      }

    } catch (error) {
      console.log('findInstances: error', error);
    }

    //console.log('CustomDataStore.findInstances: instance records=', records);

    return records;    //throw new Error('Method not implemented.');
  }

  /**
            * scenario:
            * itemId			{ items { id : value } }
            * itemKey			{ items {key: value } }
            * instance, task	{ instance: { id: instanceId }, items: { elementId: value }}
            * message			{ items: { messageId: nameofmessage, key: value } {}
            * status			{ items: {status: 'wait' } }
            * custom: { query: query, projection: projection }

  New approach:
    just like MongoDB
          * itemId			{ items { id : value } }
            * itemKey			{ items {key: value } }
            * instance, task	{  id: instanceId , items.elementId: value }
            * message			{ items.messageId: nameofmessage, key: value } {}
            * status			{ items.status: 'wait' } }
            * custom: { query: query, projection: projection }

     Problem with Mongodb:	projection $elematch returns only the first record
   *
   * @param query
   */
  async findItems(query: any): Promise<any[]> {
    debug('findItems: query=', query);
    //throw new Error('Method not implemented.');

    //--------------------------------------------------------------------------
    // Find bpmnProcessInstance
    //--------------------------------------------------------------------------
    let bpmnProcessInstanceArray: BpmnProcessInstance[] = undefined;
    const records: any = [];
    const itemId = query['items.id'];
    //console.log('CustomDataStore.findItems: itemId=', itemId);
    debug('findItems: itemId=', itemId);
    const eventsFilteredByQuery: any[] = [];
    try {
      //console.log('CustomDataStore.findItems: get the instances from the DB.....');
      debug('findItems: get the instances from the DB.....');
      bpmnProcessInstanceArray = await this.server.configuration.database.loopbackRepositories.bpmnProcessInstanceRepository.findNoTenantIdFilter();
      //console.log('CustomDataStore.findItems: bpmnProcessInstanceArray.lenght=', bpmnProcessInstanceArray.length);
      debug('findItems: bpmnProcessInstanceArray.lenght=', bpmnProcessInstanceArray.length);

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < bpmnProcessInstanceArray.length; index++) {
        /*
        const bpmnProcessInstanceExample =
        {
          endedAt: null,
          id: "78a20be8-d9d8-4c04-9999-3893b8544bef",
          items: [
            {
              elementId: "StartEvent_1",
              endedAt: "2021-11-29T23:39:47.117Z",
              id: "01568114-d32b-43b1-bf5d-0237f0ae421a",
              name: "New Collaborator Arrived",
              seq: 0,
              startedAt: "2021-11-29T23:39:47.117Z",
              status: "end",
              tokenId: 0,
              type: "bpmn:StartEvent",
            },
            {
              elementId: "Flow_19jocqh",
              endedAt: null,
              id: "956a6539-068c-40f1-8506-4381d8ddbe26",
              seq: 1,
              status: "end",
              tokenId: 0,
              type: "bpmn:SequenceFlow",
            },
            {
              elementId: "Activity_0zler0n",
              endedAt: null,
              id: "987a4b7f-d2fb-41f5-a68a-3e6ff846c7f4",
              name: "Make a request for Facility Access",
              seq: 2,
              startedAt: "2021-11-29T23:39:47.124Z",
              status: "wait",
              tokenId: 0,
              type: "bpmn:UserTask"
            },
          ],
          name: "new-user-authorization",
          startedAt: "2021-11-29T23:39:47.115Z",
          status: "running",
        }
        */
        const bpmnProcessInstance = bpmnProcessInstanceArray[index];
        //console.log('CustomDataStore.findItems: bpmnProcessInstance.name=', bpmnProcessInstance.name);
        debug('findItems: bpmnProcessInstance.name=', bpmnProcessInstance.name);
        /*
        const itemsExamples = [
          {
            "id": "f796ce6d-78a9-4c08-85f8-7a1d4858df10",
            "seq": 0,
            "tokenId": 0,
            "elementId": "StartEvent_1",
            "name": "New Collaborator Arrived",
            "status": "end",
            "startedAt": "2022-10-18T10:10:12.093Z",
            "endedAt": "2022-10-18T10:10:12.093Z",
            "type": "bpmn:StartEvent"
          },
          {
            "id": "845e28d9-7796-4bbe-9fe0-a94007e5c22d",
            "seq": 1,
            "tokenId": 0,
            "elementId": "Flow_19jocqh",
            "status": "end",
            "endedAt": null,
            "type": "bpmn:SequenceFlow"
          },
        ];
        */
        /*
         const itemsString = bpmnProcessInstance.items.toString();
         debug('findItems: parsing string bpmnProcessInstance.items=', itemsString);
         const itemsStringValidJson = itemsString.replace(/'''/g, '"');
         debug('findItems: itemsStringValidJson=', itemsStringValidJson);
         const bpmnProcessInstanceItemArray: any[] = JSON.parse(itemsStringValidJson);
         */
        const bpmnProcessInstanceItemArray: any = bpmnProcessInstance.items;
        //debug('findItems: bpmnProcessInstanceItemArray=', bpmnProcessInstanceItemArray);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let indexItem = 0; indexItem < bpmnProcessInstanceItemArray.length; indexItem++) {
          const bpmnProcessInstanceItem = bpmnProcessInstanceItemArray[indexItem];
          //debug('findItems:     bpmnProcessInstanceItem=', bpmnProcessInstanceItem);
          if (bpmnProcessInstanceItem.id === itemId) {
            //this.bpmnProcessInstance = theBpmnProcessInstance;
            //this.bpmnProcessInstanceItem = bpmnProcessInstanceItem;
            //console.log('CustomDataStore.findItems: founded bpmnProcessInstance=', bpmnProcessInstanceItem);

            // add aditional info
            bpmnProcessInstanceItem['processName'] = bpmnProcessInstance.name;
            bpmnProcessInstanceItem['data'] = bpmnProcessInstance.data;
            bpmnProcessInstanceItem['instanceId'] = bpmnProcessInstance.id;

            // change property data name
            //bpmnProcessInstanceItem['saved'] = bpmnProcessInstance.savedAt;
            //debug('findItems:     modified bpmnProcessInstanceItem=', bpmnProcessInstanceItem);

            records.push(bpmnProcessInstanceItem)

          }
        }
      }

    } catch (error) {
      //console.log('CustomDataStore.findItems: bpmnProcessModelArray not found !');
      console.error('CustomDataStore.findItems: bpmnProcessInstanceArray processing error:', error);
    }

    //console.log('CustomDataStore.findItems: item records=', records);
    debug('findItems: item records=', records);

    return records;

    /* OLD
    // let us rebuild the query form {status: value} to >  "tokens.items.status": "wait"
    const result = this.translateCriteria(query);

    const records = await this.db.find(this.dbConfiguration.db, Instance_collection, result.query, result.projection);

    this.logger.log('...find items for ' + JSON.stringify(query) + " result :" + JSON.stringify(result) + " recs:" + records.length);

    return this.getItemsFromInstances(records, result.match);
    */
  }

  private translateCriteria(query) {

    const match = {};
    let hasMatch = false;
    let projection = {};
    {
      const newQuery = {};
      Object.keys(query).forEach(key => {
        const val = query[key];
        if (key.startsWith('items.')) {
          key = key.replace('items.', '');
          match[key] = val;
          hasMatch = true;
        }
        else
          newQuery[key] = val;
      });

      if (hasMatch) {
        newQuery['items'] = {$elemMatch: match};
        projection = {id: 1, data: 1, name: 1, "items": 1}; // { $elemMatch: match } };
        query = newQuery;
      }
      else
        projection = {id: 1, data: 1, name: 1, "items": 1};
    }
    return {query: query, projection: projection, match};
  }


  async deleteInstances(query?: any): Promise<void> {
    throw new Error('Method not implemented.');

    // TODO
    /*
    await this.cache.shutdown();
    return this.db.remove(this.dbConfiguration.db, Instance_collection, query);
    */
  }

  /**
     * first time installation of DB
     *
     * creates a new collection and add an index
     *
     * */
  async install() {
    throw new Error('Method not implemented.');
    /* OLD
    return this.db.createIndex(this.dbConfiguration.db, Instance_collection, {id: 1}, {unique: true});
    */
  }



}

export {CustomDataStore};

