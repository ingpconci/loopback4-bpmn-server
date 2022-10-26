import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'appuser', table: 'bpmnProcessUserRole'}
  }
})
export class BpmnProcessUserRole extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    length: 45,
    postgresql: {columnName: 'name', dataType: 'character varying', dataLength: 45, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  name: string;

  @property({
    type: 'string',
    length: 255,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'description', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  description?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'note', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  note?: string;

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
  [prop: string]: any;

  constructor(data?: Partial<BpmnProcessUserRole>) {
    super(data);
  }
}

export interface BpmnProcessUserRoleRelations {
  // describe navigational properties here
}

export type BpmnProcessUserRoleWithRelations = BpmnProcessUserRole & BpmnProcessUserRoleRelations;
