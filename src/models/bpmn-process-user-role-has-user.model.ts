import {belongsTo, Entity, model, property} from '@loopback/repository';
import {BpmnProcessUserRole} from './bpmn-process-user-role.model';
import {User} from './user.model';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'appuser', table: 'bpmnProcessUserRoleHasUser'}
  }
})
export class BpmnProcessUserRoleHasUser extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  id: number;



  /*
  @property({
    type: 'number',
    required: true,
    scale: 0,
    postgresql: {columnName: 'bpmnProcessUserRole_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  bpmnProcessUserRoleId: number;
  */

  @belongsTo(() => BpmnProcessUserRole, {keyFrom: 'bpmnProcessUserRoleId'}, {name: 'bpmnProcessUserRole_id'})
  bpmnProcessUserRoleId: number;

  /*
  @property({
    type: 'number',
    required: true,
    scale: 0,
    postgresql: {columnName: 'user_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  userId: number;
  */
  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;

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

  //assignedUserFilterValueNumber
  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    postgresql: {columnName: 'assignedUserFilterValueNumber', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES'},
  })
  assignedUserFilterValueNumber?: number;


  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<BpmnProcessUserRoleHasUser>) {
    super(data);
  }
}

export interface BpmnProcessUserRoleHasUserRelations {
  // describe navigational properties here
}

export type BpmnProcessUserRoleHasUserWithRelations = BpmnProcessUserRoleHasUser & BpmnProcessUserRoleHasUserRelations;
