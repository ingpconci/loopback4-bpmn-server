import {Entity, model, property} from '@loopback/repository';


@model({
  settings: {idInjection: false, postgresql: {schema: 'appuser', table: 'bpmnProcessInstance'}}
})
export class BpmnProcessInstance extends Entity {
  @property({
    type: 'string',
    id: true,
    postgresql: {columnName: 'id', dataType: 'character varying', dataLength: 128, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    length: 255,
    jsonSchema: {nullable: false},
    postgresql: {columnName: 'name', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  name: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'counter', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  counter: number;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'source', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  source: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'items', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  items?: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'tokens', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  tokens?: string;

  /*
  @property({
    type: 'array',
    itemType: 'object',
  })
  loops?: object[];
  */
  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'loops', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  loops?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'startedAt', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  startedAt?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'endedAt', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  endedAt?: string;

  @property({
    type: 'string',
    length: 255,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'status', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  status?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'savedAt', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  saved?: string;

  /*
  @property({
    type: 'object',
  })
  data?: object;
  */
  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'data', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  data?: string;


  /*
  @property({
    type: 'array',
    itemType: 'string',
  })
  logs?: string[];
  */
  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'logs', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  logs?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'parentItemId', dataType: 'character varying', dataLength: 128, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  parentItemId?: string;

  /*
  TENANT ID FILTER
  */
  @property({
    type: 'number',
    required: false,
    scale: 0,
    postgresql: {columnName: 'tenantId', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  tenantId: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'note', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  note?: string;


  constructor(data?: Partial<BpmnProcessInstance>) {
    super(data);
  }
}

export interface BpmnProcessInstanceRelations {
  // describe navigational properties here
}

export type BpmnProcessInstanceWithRelations = BpmnProcessInstance & BpmnProcessInstanceRelations;
