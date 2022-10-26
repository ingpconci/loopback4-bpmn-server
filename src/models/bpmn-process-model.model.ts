import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'appuser', table: 'bpmnProcessModel'}}
})
export class BpmnProcessModel extends Entity {
  
  @property({
    type: 'number',
    id: false,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  id: number;

  @property({
    type: 'string',
    id: true,
    generated: false,
    length: 255,
    postgresql: {columnName: 'name', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  name: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'sourceXmlData', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  sourceXmlData?: string;

  @property({
    type: 'string',
    length: 255,
    postgresql: {columnName: 'sourceFileName', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  sourceFileName?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'sourceFileProperties', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  sourceFileProperties?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'svg', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  svg?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'processes', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  processes?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'events', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  events?: string;

  @property({
    type: 'date',
    postgresql: {columnName: 'savedAt', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  savedAt?: string;

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

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //[prop: string]: any;

  constructor(data?: Partial<BpmnProcessModel>) {
    super(data);
  }
}

export interface BpmnProcessModelRelations {
  // describe navigational properties here
}

export type BpmnProcessModelWithRelations = BpmnProcessModel & BpmnProcessModelRelations;
