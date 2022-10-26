import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import { TenantTableFilterRepository } from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessInstance, BpmnProcessInstanceRelations} from '../models';

export class BpmnProcessInstanceRepository extends TenantTableFilterRepository<
  BpmnProcessInstance,
  typeof BpmnProcessInstance.prototype.id,
  BpmnProcessInstanceRelations
> {
  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource,
  ) {
    super(BpmnProcessInstance, dataSource);
  }
}
