import {BpmnModelData, BPMNServer, Definition, IBpmnModelData, IEventData, IModelsDatastore, MongoDB, ServerComponent} from 'bpmn-server/index';
import {BpmnProcessModel} from '../../models';

const fs = require('fs');
const Path = require('path')

const debug = require('debug')('lloopback:bpmnserver-component:bpmn-server:custom-model-data-store');

// eslint-disable-next-line @typescript-eslint/naming-convention
const Definition_collection = 'wf_models';


class CustomModelsDatastoreDB extends ServerComponent implements IModelsDatastore {
  dbConfiguration;
  db;

  constructor(server: BPMNServer) {
    console.log('CustomModelsDatastoreDB.constructor: start');
    debug('ModelsDatastoreDB.constructor: Starting..');
    super(server);

    this.dbConfiguration = this.configuration.database.MongoDB;
    this.db = new MongoDB(this.dbConfiguration, this.logger);

    //console.log('ModelsDatastoreDB.constructor: End');
    debug('ModelsDatastoreDB.constructor: End');
  }


  async getList(): Promise<string[]> {
    //throw new Error('Method not implemented.');
    //--------------------------------------------------------------------------
    // Find bpmnProcessModel
    //--------------------------------------------------------------------------
    let bpmnProcessModelArray = undefined;
    try {
      //console.log('ModelsDatastoreDB.getList: get the models from the DB.....');
      debug('ModelsDatastoreDB.getList: get the models from the DB.....');
      bpmnProcessModelArray = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.findNoTenantIdFilter();
      //console.log('ModelsDatastoreDB.getList: bpmnProcessModelArray.lenght=', bpmnProcessModelArray.length);
      debug('ModelsDatastoreDB.getList: bpmnProcessModelArray.lenght=', bpmnProcessModelArray.length);
      for (let index = 0; index < bpmnProcessModelArray.length; index++) {
        const bpmnProcessModel = bpmnProcessModelArray[index];
        //console.log('ModelsDatastoreDB.getList: bpmnProcessModel.name=', bpmnProcessModel.name);
        debug('ModelsDatastoreDB.getList: ' + index + ' bpmnProcessModel.name=', bpmnProcessModel.name);
      }
    } catch (error) {
      //console.log('ModelsDatastoreDB.getList: bpmnProcessModelArray not found !');
      debug('ModelsDatastoreDB.getList: bpmnProcessModelArray not found !');
    }

    const records: any = [];
    debug('ModelsDatastoreDB.getList: find events for ' + " records.length:" + records.length);

    const list: any[] = [];
    records.forEach((r: {name: any; saved: any;}) => {
      list.push({name: r.name, saved: r.saved});
    });
    return list;

    /* OLD
    const records = await this.db.find(this.dbConfiguration.db, Definition_collection, {}, {});

    this.logger.log('find events for ' + " recs:" + records.length);
    const list = [];
    records.forEach(r => {list.push({name: r.name, saved: r.saved});});
    return list;
    */
  }

  async load(name: any): Promise<Definition> {
    //throw new Error('Method not implemented.');
    const data = await this.loadModel(name);
    const definition = new Definition(name, data.source, this.server);
    await definition.load();
    return definition;
  }

  async getSource(name: any): Promise<string> {
    //throw new Error('Method not implemented.');
    const model = await this.loadModel(name);
    return model.source;
  }

  async getSVG(name: any): Promise<string> {
    //throw new Error('Method not implemented.');
    const model = await this.loadModel(name);
    return model.svg;
  }

  async loadModel(name: any): Promise<BpmnModelData> {
    //throw new Error('Method not implemented.');
    //--------------------------------------------------------------------------
    // Find bpmnProcessModel
    //--------------------------------------------------------------------------
    let bpmnProcessModelFound = undefined;
    try {
      //console.log('ModelsDatastoreDB.loadModel: verify if exist model in the DB.....');
      debug('ModelsDatastoreDB.loadModel: verify if exist model in the DB.....');
      bpmnProcessModelFound = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.findByIdNoTenantIdFilter(name);
      //console.log('ModelsDatastoreDB.loadModel: bpmnProcessModelFound=', bpmnProcessModelFound);
      debug('ModelsDatastoreDB.loadModel: bpmnProcessModelFound=', bpmnProcessModelFound);
    } catch (error) {
      //console.log('ModelsDatastoreDB.loadModel: bpmnProcessModel not found with modelName=', name);
      debug('ModelsDatastoreDB.loadModel: bpmnProcessModel not found with modelName=', name);
    }
    const records: any = [];

    /*
    const records = await this.db.find(this.dbConfiguration.db, Definition_collection, {name: name}, {});
    */
    this.logger.log('find model for  ' + name + " recs:" + records.length);
    debug('ModelsDatastoreDB.loadModel: find model for  ' + name + " recs:" + records.length);
    return records[0];
  }


  async save(name: any, source: any, svg?: any): Promise<any> {
    //throw new Error('Method not implemented.');
    debug('ModelsDatastoreDB.save: saving  name:', name);
    const bpmnModelData: BpmnModelData = new BpmnModelData(name, source, svg, null, null);
    const definition = new Definition(bpmnModelData.name, bpmnModelData.source, this.server);
    await definition.load();

    bpmnModelData.parse(definition);
    await this.saveModel(bpmnModelData);

    debug('ModelsDatastoreDB.save: End');
    return bpmnModelData;
  }


  async findEvents(query: any): Promise<IEventData[]> {
    debug('ModelsDatastoreDB.findEvents: verify if exist events in the process models query=', query);

    //--------------------------------------------------------------------------
    // Find bpmnProcessModel
    //--------------------------------------------------------------------------
    let bpmnProcessModelArray = undefined;
    const eventsFilteredByQuery: any[] = [];
    try {
      //console.log('ModelsDatastoreDB.findEvents: get the models from the DB.....');
      debug('ModelsDatastoreDB.findEvents: get the models from the DB.....');
      bpmnProcessModelArray = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.findNoTenantIdFilter();
      //console.log('ModelsDatastoreDB.findEvents: bpmnProcessModelArray.lenght=', bpmnProcessModelArray.length);
      debug('ModelsDatastoreDB.findEvents: bpmnProcessModelArray.lenght=', bpmnProcessModelArray.length);

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let index = 0; index < bpmnProcessModelArray.length; index++) {
        const bpmnProcessModel = bpmnProcessModelArray[index];
        //console.log('ModelsDatastoreDB.findEvents: bpmnProcessModel.name=', bpmnProcessModel.name);
        debug('ModelsDatastoreDB.findEvents: bpmnProcessModel.name=', bpmnProcessModel.name);
        /*
        const bpmnProcessModelExample =
        {
            name: 'new-user-authorization',
            sourceXmlData: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/201005c/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI"' +
                '  </bpmndi:BPMNDiagram>\n' +
                '</bpmn:definitions>' +
                '.........',
            sourceFileName: '',
            sourceFileProperties: '{}',
            svg: '<?xml version="1.0" encoding="utf-8"?>\n' +
                '<!-- created with bpmn-js / http://bpmn.io -->\n' +
                '.........',
            processes: [
                {
                    id: 'Process_9f81ceed-02d7-4026-9f39-fdf350be91f4',
                    isExecutable: true
                }
            ],
            events: [
                {
                    elementId: 'StartEvent_1',
                    name: 'New Collaborator Arrived',
                    type: 'bpmn:StartEvent',
                    processId: 'Process_9f81ceed-02d7-4026-9f39-fdf350be91f4'
                }
            ],
            savedAt: '2021 - 11 - 19T17: 48: 18.431Z'
        }
        */
        //--------------------------------------------------------------------------
        // Process  events query={ 'events.subType': 'Timer' }
        //--------------------------------------------------------------------------
        bpmnProcessModel.events.forEach((eventItem: {type: any;}) => {
          if (eventItem.type) {

            /*
            TODO
            */
            eventsFilteredByQuery.push();
          }

        });


      }
      //console.log('ModelsDatastoreDB.findEvents: bpmnProcessModelArray not found !');
      debug('ModelsDatastoreDB.findEvents: eventsFilteredByQuery', eventsFilteredByQuery);

    } catch (error) {
      //console.log('ModelsDatastoreDB.findEvents: bpmnProcessModelArray not found !');
      debug('ModelsDatastoreDB.findEvents: bpmnProcessModelArray not found !');
    }

    /*
    const projection = {}; // this.getProjection(query);
    const records = await this.db.find(this.dbConfiguration.db, Definition_collection, query, projection);
    */
    const records: any = [];

    //throw new Error('Method not full implemented.');

    this.logger.log('...find events for ' + JSON.stringify(query) + " recs:" + records.length);

    const events = [];

    records.forEach(rec => {
      rec.events.forEach(ev => {
        let pass = true;

        if (query) {
          const keys = Object.keys(query);
          keys.forEach(key => {
            const prop = key.replace('events.', '');
            if (ev[prop] !== query[key])
              pass = false;
          });
        }
        if (pass) {
          ev.modelName = rec.name;
          ev._id = rec._id;
          events.push(ev);
        }
      });
    });

    return events;
  }


  async install() {
    throw new Error('Method not implemented.');
    //return this.db.createIndex(this.dbConfiguration.db, Definition_collection, {name: 1}, {unique: true});
  }

  async import(data: any) {
    debug('ModelsDatastoreDB.import: Starting data:', data);
    throw new Error('Method not implemented.');
    /*
    console.log('inserting');
    return this.db.insert(this.dbConfiguration.db, Definition_collection, data);
    */
  }

  async updateTimer(name): Promise<boolean> {

    const source = await this.getSource(name);
    const model: BpmnModelData = new BpmnModelData(name, source, null, null, null);
    const definition = new Definition(model.name, model.source, this.server);
    await definition.load();

    model.parse(definition);

    //--------------------------------------------------------------------------
    // Update bpmnProcessModel
    //--------------------------------------------------------------------------
    const bpmnProcessModel: BpmnProcessModel = new BpmnProcessModel;
    /*
    bpmnProcessModel.name = model.name;
    bpmnProcessModel.savedAt = model.savedAt;
    bpmnProcessModel.sourceXmlData = model.source;
    bpmnProcessModel.sourceFileName = '';
    bpmnProcessModel.sourceFileProperties = JSON.stringify({});;
    bpmnProcessModel.svg = model.svg;
    bpmnProcessModel.processes = JSON.stringify(model.processes);
    */
    bpmnProcessModel.events = JSON.stringify(model.events);
    //console.log('ModelsDatastoreDB.updateTimer: bpmnProcessModel=', bpmnProcessModel);
    debug('ModelsDatastoreDB.updateTimer: bpmnProcessModel=', bpmnProcessModel);


    //--------------------------------------------------------------------------
    // Find bpmnProcessModel
    //--------------------------------------------------------------------------
    let bpmnProcessModelFound = undefined;
    try {
      debug('ModelsDatastoreDB.updateTimer: verify if exist model in the DB.....');
      const filterLb4 = {
        where: {
          name: {
            eq: model.name
          }
        }
      }
      bpmnProcessModelFound = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.findOneNoTenantIdFilter(filterLb4);
      debug('ModelsDatastoreDB.updateTimer: bpmnProcessModelFound.id=', bpmnProcessModelFound.id, ' bpmnProcessModelFound.name=', bpmnProcessModelFound.name);
    } catch (error) {
      debug('ModelsDatastoreDB.updateTimer: bpmnProcessModel not found with modelName=', model.name);
    }

    if (bpmnProcessModelFound && bpmnProcessModelFound.id > 0) {
      const id = bpmnProcessModelFound.id;
      const resultUpdate = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.updateByIdNoTenantIdFilter(id, bpmnProcessModel);
      //this.logger.log("ModelsDatastoreDB.updateTimer: model events updated! ");
      debug('ModelsDatastoreDB.updateTimer: model events updated! ');
    }

    /*
    await this.db.update(this.dbConfiguration.db, Definition_collection,
      {name: model.name},
      {
        $set:
        {
          events: model.events
        }
      }, {upsert: false});

      */
    this.logger.log("updating model");

    this.logger.log('DataStore:saving Complete');

    debug('ModelsDatastoreDB.updateTimer: End!');
    return true;

  }

  async saveModel(model: IBpmnModelData): Promise<boolean> {
    //throw new Error('Method not implemented.');
    this.logger.log("Saving Model " + model.name);
    debug('ModelsDatastoreDB.saveModel: Starting..');

    let recs;
    model.saved = new Date().toISOString();

    // name id
    const modelName = model.name;
    //--------------------------------------------------------------------------
    // Find bpmnProcessModel
    //--------------------------------------------------------------------------
    let bpmnProcessModelFound = undefined;
    try {
      debug('ModelsDatastoreDB.saveModel: verify if exist model in the DB.....');
      const filterLb4 = {
        where: {
          name: {
            eq: model.name
          }
        }
      }
      bpmnProcessModelFound = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.findOneNoTenantIdFilter(filterLb4);
      debug('ModelsDatastoreDB.saveModel: bpmnProcessModelFound.id=', bpmnProcessModelFound.id, ' bpmnProcessModelFound.name=', bpmnProcessModelFound.name);
    } catch (error) {
      debug('ModelsDatastoreDB.saveModel: bpmnProcessModel not found with modelName=', model.name);
    }

    if (bpmnProcessModelFound && bpmnProcessModelFound.id > 0) {
      //--------------------------------------------------------------------------
      // Update bpmnProcessModel
      //--------------------------------------------------------------------------
      const updatedBpmnProcessModel: BpmnProcessModel = new BpmnProcessModel;
      /*
      updatedBpmnProcessModel.name = model.name;
      updatedBpmnProcessModel.savedAt = model.savedAt;
      updatedBpmnProcessModel.sourceXmlData = model.source;
      updatedBpmnProcessModel.sourceFileName = '';
      updatedBpmnProcessModel.sourceFileProperties = JSON.stringify({});;
      updatedBpmnProcessModel.svg = model.svg;
      updatedBpmnProcessModel.processes = JSON.stringify(model.processes);
      */
      updatedBpmnProcessModel.events = JSON.stringify(model.events);
      //console.log('ModelsDatastoreDB.saveModel: updatedBpmnProcessModel=', updatedBpmnProcessModel);
      debug('ModelsDatastoreDB.saveModel:  updatedBpmnProcessModel=', updatedBpmnProcessModel);
      const id = bpmnProcessModelFound.id;
      await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.updateByIdNoTenantIdFilter(id, updatedBpmnProcessModel);
      //this.logger.log("ModelsDatastoreDB.saveModel: model events updated! ");
      debug('ModelsDatastoreDB.saveModel: model events updated! ');

    } else {
      //--------------------------------------------------------------------------
      // Insert new bpmnProcessModel
      //--------------------------------------------------------------------------
      const newBpmnProcessModel: BpmnProcessModel = new BpmnProcessModel;
      newBpmnProcessModel.name = model.name;
      newBpmnProcessModel.savedAt = model.saved;
      newBpmnProcessModel.sourceXmlData = model.source;
      newBpmnProcessModel.sourceFileName = '';
      newBpmnProcessModel.sourceFileProperties = JSON.stringify({});;
      newBpmnProcessModel.svg = model.svg;
      newBpmnProcessModel.processes = JSON.stringify(model.processes);
      newBpmnProcessModel.events = JSON.stringify(model.events);
      console.log('ModelsDatastoreDB.saveModel: newBpmnProcessModel=', newBpmnProcessModel.name);
      //const resultInsert = await this.server.bpmnProcessModelRepository.create(newBpmnProcessModel);
      const resultInsert = await this.server.configuration.database.loopbackRepositories.bpmnProcessModelRepository.createNoTenantIdFilter(newBpmnProcessModel);
      this.logger.log("ModelsDatastoreDB.saveModel: new model inserted! ");
    }

    /* OLD
    await this.db.update(this.dbConfiguration.db, Definition_collection,
      {name: model.name},
      {
        $set:
        {
          name: model.name, saved: model.saved, source: model.source, svg: model.svg, processes: model.processes, events: model.events
        }
      }, {upsert: true});
      */

    return true;
  }


  async deleteModel(name: any): Promise<void> {
    throw new Error('Method not implemented.');
    //await this.db.remove(this.dbConfiguration.db, Definition_collection, {name: name});
  }


  async renameModel(name: any, newName: any): Promise<boolean> {
    throw new Error('Method not implemented.');
    /*
    await this.db.update(this.dbConfiguration.db, Definition_collection,
      {name: name},
      {
        $set:
        {
          name: newName
        }
      }, {upsert: false});


    this.logger.log("updating model");

    this.logger.log('DataStore:saving Complete');

    return true;
    */
  }

  async export(name, folderPath) {

    const model = await this.loadModel(name);

    let fullpath = folderPath + "/" + name + ".bpmn";

    fs.writeFile(fullpath, model.source, function (err) {
      if (err) throw err;
      console.log(`Saved bpmn to ${fullpath}`);
    });

    fullpath = folderPath + "/" + name + ".svg";

    fs.writeFile(fullpath, model.svg, function (err) {
      if (err) throw err;
      console.log(`Saved svg to ${fullpath}`);
    });
  }

}

export {CustomModelsDatastore, CustomModelsDatastoreDB};


class CustomModelsDatastore extends CustomModelsDatastoreDB implements IModelsDatastore {

  definitionsPath;
  constructor(server: BPMNServer) {
    console.log('CustomModelsDatastore.constructor: start');
    super(server);
    this.definitionsPath = server.configuration.definitionsPath;

  }

  async import(data) {
    return super.import(data);

  }

  async getList(): Promise<string[]> {

    const files = [];

    fs.readdirSync(this.definitionsPath).forEach(file => {
      if (Path.extname(file) == '.bpmn') {
        let name = Path.basename(file);
        name = name.substring(0, name.length - 5);;
        files.push(name);
      }
    });

    return files;
  }

  /*
   *	loads a definition
   *
   */
  async load(name): Promise<Definition> {

    const source = await this.getSource(name);
    //const rules = this.getFile(name, 'rules');

    const definition = new Definition(name, source, this.server);
    await definition.load();
    return definition;
  }

  private getPath(name, type) {

    return this.definitionsPath + name + '.' + type;
  }

  private getFile(name, type) {

    const file = fs.readFileSync(this.getPath(name, type),
      {encoding: 'utf8', flag: 'r'});
    return file;

  }
  private saveFile(name, type, data) {
    const fullpath = this.getPath(name, type);

    fs.writeFile(fullpath, data, function (err) {
      if (err) throw err;
      console.log(`Saved ${type} to ${fullpath}`);
    });

  }
  async getSource(name): Promise<string> {

    return this.getFile(name, 'bpmn');

  }
  async getSVG(name): Promise<string> {
    return this.getFile(name, 'svg');
  }

  async save(name, bpmn, svg?): Promise<boolean> {

    this.saveFile(name, 'bpmn', bpmn);
    if (svg)
      this.saveFile(name, 'svg', svg);

    await super.save(name, bpmn, svg);

    return true;

  }

  async deleteModel(name: any): Promise<void> {

    await super.deleteModel(name);
    await fs.unlink(this.definitionsPath + name + '.bpmn', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
    await fs.unlink(this.definitionsPath + name + '.svg', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
  }
  async renameModel(name: any, newName: any): Promise<boolean> {

    await super.renameModel(name, newName);
    await fs.rename(this.definitionsPath + name + '.bpmn', this.definitionsPath + newName + '.bpmn', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
    await fs.rename(this.definitionsPath + name + '.svg', this.definitionsPath + newName + '.svg', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
    return true;
  }
  /**
   *
   * reconstruct the models database from files
   *
   * use when modifying the files manually or importing new environment
   *
   * */
  async rebuild(model = null) {

    if (model)
      return this.rebuildModel(model);
    const filesList = await this.getList();
    const models = new Map();

    filesList.forEach(f => {
      const path = this.definitionsPath + f + '.bpmn';

      const stats = fs.statSync(path);
      const mtime = stats.mtime;
      models.set(f, mtime);
    });
    const dbList = await super.getList();
    dbList.forEach(model => {
      const name = model['name'];
      const saved = new Date(model['saved']);
      const entry = models.get(name);
      if (entry) {
        if (saved.getTime() > entry.getTime()) {
          models.delete(name);
        }
      }
      else {
        super.deleteModel(name);
      }
    });
    let i;

    for (const entry of models.entries()) {
      const name = entry[0];
      await this.rebuildModel(name);
    }
  }
  private async rebuildModel(name) {
    console.log("rebuilding " + name);
    const source = await this.getSource(name);
    let svg;
    try {
      svg = await this.getSVG(name);
    }
    catch (exc) {
      //console.log(exc);
    }
    await super.save(name, source, svg);

  }

}


