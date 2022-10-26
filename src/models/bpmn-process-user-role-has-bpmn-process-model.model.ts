import { Entity, model, property, belongsTo } from '@loopback/repository';
import { BpmnProcessModel } from './bpmn-process-model.model';
import { BpmnProcessUserRole } from './bpmn-process-user-role.model';

@model({
  settings: {
    idInjection: false,
    postgresql: { schema: 'appuser', table: 'bpmnProcessUserRoleHasBpmnProcessModel' }
  }
})
export class BpmnProcessUserRoleHasBpmnProcessModel extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO' },
  })
  id: number;

  /*
  @property({
    type: 'number',
    required: true,
    scale: 0,
    postgresql: { columnName: 'bpmnProcessUserRole_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO' },
  })
  bpmnProcessUserRoleId: number;
  */
  @belongsTo(() => BpmnProcessUserRole, {keyFrom: 'bpmnProcessUserRoleId', keyTo: 'id' },{ name: 'bpmnProcessUserRole_id',})
  bpmnProcessUserRoleId: number;

  /*
  @property({
    type: 'number',
    required: true,
    scale: 0,
    postgresql: {columnName: 'bpmnProcessModel_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO'},
  })
  bpmnProcessModelId: number;
  */
  @belongsTo(() => BpmnProcessModel, {keyFrom: 'bpmnProcessModelId', keyTo: 'id' },{ name: 'bpmnProcessModel_id',})
  bpmnProcessModelId: number;


  @property({
    type: 'number',
    required: false,
    scale: 0,
    postgresql: { columnName: 'tenantId', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES' },
  })
  tenantId: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<BpmnProcessUserRoleHasBpmnProcessModel>) {
    super(data);
  }
}

export interface BpmnProcessUserRoleHasBpmnProcessModelRelations {
  // describe navigational properties here
}

export type BpmnProcessUserRoleHasBpmnProcessModelWithRelations = BpmnProcessUserRoleHasBpmnProcessModel & BpmnProcessUserRoleHasBpmnProcessModelRelations;
