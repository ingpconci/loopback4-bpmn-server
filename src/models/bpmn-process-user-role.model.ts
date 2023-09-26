import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {BpmnProcessUserRoleGroup} from './bpmn-process-user-role-group.model';
import {BpmnProcessUserRoleHasBpmnProcessModel} from './bpmn-process-user-role-has-bpmn-process-model.model';
import {BpmnProcessUserRoleHasUser} from './bpmn-process-user-role-has-user.model';

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


  //groupId
  /*
  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'groupId', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  groupId?: number;
  */
  @belongsTo(() => BpmnProcessUserRoleGroup, {keyFrom: 'bpmnProcessUserRoleGroupId'}, {name: 'bpmnProcessUserRoleGroupId', jsonSchema: {nullable: true}})
  bpmnProcessUserRoleGroupId?: number;

  //propertiesJson
  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'propertiesJson', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  propertiesJson?: string;

  //processVariableToFilterAssignedUsers
  @property({
    type: 'string',
    length: 255,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'processVariableToFilterAssignedUsers', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  processVariableToFilterAssignedUsers?: string;


  //processVariableToGetAssignedUserId
  @property({
    type: 'string',
    length: 255,
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'processVariableToGetAssignedUserId', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES'},
  })
  processVariableToGetAssignedUserId?: string;


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

  @hasMany(() => BpmnProcessUserRoleHasBpmnProcessModel)
  bpmnProcessUserRoleHasBpmnProcessModels: BpmnProcessUserRoleHasBpmnProcessModel[];
  @hasMany(() => BpmnProcessUserRoleHasUser)
  bpmnProcessUserRoleHasUsers: BpmnProcessUserRoleHasUser[];

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
