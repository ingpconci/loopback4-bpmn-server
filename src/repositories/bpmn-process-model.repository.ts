import {inject} from '@loopback/core';
import {TenantTableFilterRepository} from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessModel, BpmnProcessModelRelations} from '../models';

export class BpmnProcessModelRepository extends TenantTableFilterRepository<
  BpmnProcessModel,
  typeof BpmnProcessModel.prototype.name,
  BpmnProcessModelRelations
> {
  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource,
  ) {
    super(BpmnProcessModel, dataSource);
  }
}
