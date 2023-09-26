import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'appuser', table: 'bpmnProcessUserRoleGroup'}
  }
})
export class BpmnProcessUserRoleGroup extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'tenantId', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  tenantId: number;

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

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'propertiesJson', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  propertiesJson?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<BpmnProcessUserRoleGroup>) {
    super(data);
  }
}

export interface BpmnProcessUserRoleGroupRelations {
  // describe navigational properties here
}

export type BpmnProcessUserRoleGroupWithRelations = BpmnProcessUserRoleGroup & BpmnProcessUserRoleGroupRelations;
