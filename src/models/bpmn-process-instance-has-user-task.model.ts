import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'appuser', table: 'bpmnProcessInstanceHasUserTask'}
  }
})
export class BpmnProcessInstanceHasUserTask extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'tenantId', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  tenantId: number;

  @property({
    type: 'string',
    required: true,
    length: 36,
    postgresql: {columnName: 'bpmnProcessInstanceId', dataType: 'character varying', dataLength: 36, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  bpmnProcessInstanceId: string;

  @property({
    type: 'string',
    required: true,
    length: 36,
    postgresql: {columnName: 'taskId', dataType: 'character varying', dataLength: 36, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  taskId: string;

  @property({
    type: 'string',
    required: true,
    length: 36,
    postgresql: {columnName: 'taskElementId', dataType: 'character varying', dataLength: 36, dataPrecision: null, dataScale: null, nullable: 'NO'},
  })
  taskElementId: string;

  @property({
    type: 'string',
    length: 45,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'bpmnProcessUserRoleName', dataType: 'character varying', dataLength: 45, dataPrecision: null, dataScale: null, nullable: 'YES'}
  })
  bpmnProcessUserRoleName?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<BpmnProcessInstanceHasUserTask>) {
    super(data);
  }
}

export interface BpmnProcessInstanceHasUserTaskRelations {
  // describe navigational properties here
}

export type BpmnProcessInstanceHasUserTaskWithRelations = BpmnProcessInstanceHasUserTask & BpmnProcessInstanceHasUserTaskRelations;
