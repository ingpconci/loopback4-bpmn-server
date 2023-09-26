import {Model, model, property} from '@loopback/repository';

@model()
export class BpmnProcessInstanceItem extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  elementId: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'string',
  })
  startedAt?: string;

  @property({
    type: 'string',
  })
  endedAt?: string;


  constructor(data?: Partial<BpmnProcessInstanceItem>) {
    super(data);
  }
}

export interface BpmnProcessInstanceItemRelations {
  // describe navigational properties here
}

export type BpmnProcessInstanceItemWithRelations = BpmnProcessInstanceItem & BpmnProcessInstanceItemRelations;
