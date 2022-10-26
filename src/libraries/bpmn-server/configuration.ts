
import {ACL, BPMNServer, Configuration, IAM, Logger} from 'bpmn-server/dist/index';
import {MyAppDelegate} from './appDelegate';
import {CustomDataStore} from './custom-data-store';
import {CustomModelsDatastore} from './custom-model-data-store';

//const dotenv = require('dotenv');
//const res = dotenv.config();


const definitionsPath = __dirname + '/processes/';
const templatesPath = __dirname + '/emailTemplates/';
const configuration = new Configuration(
	{
		definitionsPath: definitionsPath,
		templatesPath: templatesPath,
		timers: {
			//forceTimersDelay: 1000,
			precision: 3000,
		},
		database: {
			MongoDB:
			{
				db_url: "mongodb://localhost:27017?retryWrites=true&w=majority",  //db_url: process.env.MONGO_DB_URL,
				db: 'bpmn',//'bpmn'  process.env.MONGO_DB_NAME
			},
			loopbackRepositories: {

			}
		},
		apiKey: '', //process.env.API_KEY
		/* Define Server Services */
		logger: function (server: any) {
			//new Logger(server);
			new Logger({toConsole: false, toFile: '', callback: null});
		},
		definitions: function (server: BPMNServer) {
			return new CustomModelsDatastore(server);
		},
		appDelegate: function (server: any) {
			return new MyAppDelegate(server);
		},
		dataStore: function (server: any) {
			return new CustomDataStore(server);
		},
		IAM: function (server: any) {
			return new IAM(server);
		},
		ACL: function (server: any) {
			return new ACL(server);
		}
	});


export {configuration};

