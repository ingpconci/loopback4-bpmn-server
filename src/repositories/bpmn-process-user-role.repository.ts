import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import { TenantTableFilterRepository } from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessUserRole, BpmnProcessUserRoleRelations} from '../models';

export class BpmnProcessUserRoleRepository extends TenantTableFilterRepository<
  BpmnProcessUserRole,
  typeof BpmnProcessUserRole.prototype.id,
  BpmnProcessUserRoleRelations
> {
  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource,
  ) {
    super(BpmnProcessUserRole, dataSource);
  }
}
