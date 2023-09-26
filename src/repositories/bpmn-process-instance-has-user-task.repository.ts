import {inject} from '@loopback/core';
import {TenantTableFilterRepository} from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessInstanceHasUserTask, BpmnProcessInstanceHasUserTaskRelations} from '../models';

export class BpmnProcessInstanceHasUserTaskRepository extends TenantTableFilterRepository<
  BpmnProcessInstanceHasUserTask,
  typeof BpmnProcessInstanceHasUserTask.prototype.id,
  BpmnProcessInstanceHasUserTaskRelations
> {
  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource,
  ) {
    super(BpmnProcessInstanceHasUserTask, dataSource);
  }
}
