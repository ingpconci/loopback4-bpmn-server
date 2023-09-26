import {Model, model, property} from '@loopback/repository';
import {BpmnProcessInstanceItem} from './bpmn-process-instance-item.model';
import {BpmnProcessInstance} from './bpmn-process-instance.model';


@model()
export class AssignationInfo {
  @property() assignedUsers: AssignedUser[];
}


export class AssignedUser {
  @property() id: number;
  @property() firstname: string;
  @property() lastname: string;
}



@model()
export class BpmnProcessUserTask extends Model {
  @property({
    type: 'string',
    required: true,
  })
  taskName: string;

  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  taskElementId: string;

  @property({
    type: 'string',
  })
  taskDescription?: string;

  @property({
    type: 'date',
  })
  taskStartedAt?: string;

  @property({
    type: 'string',
  })
  taskAssignedRole?: string;

  @property({
    type: 'object',
  })
  taskAssignationInfo?: object;

  @property({
    type: 'object',
  })
  processInstance?: Partial<BpmnProcessInstance>;

  @property({
    type: 'object',
  })
  processInstanceItem?: Partial<BpmnProcessInstanceItem>;


  constructor(data?: Partial<BpmnProcessUserTask>) {
    super(data);
  }
}

export interface BpmnProcessUserTaskRelations {
  // describe navigational properties here
}

export type BpmnProcessUserTaskWithRelations = BpmnProcessUserTask & BpmnProcessUserTaskRelations;
