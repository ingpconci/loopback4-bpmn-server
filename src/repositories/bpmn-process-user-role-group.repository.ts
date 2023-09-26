import {inject} from '@loopback/core';
import {TenantTableFilterRepository} from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessUserRoleGroup, BpmnProcessUserRoleGroupRelations} from '../models';

export class BpmnProcessUserRoleGroupRepository extends TenantTableFilterRepository<
  BpmnProcessUserRoleGroup,
  typeof BpmnProcessUserRoleGroup.prototype.id,
  BpmnProcessUserRoleGroupRelations
> {
  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource,
  ) {
    super(BpmnProcessUserRoleGroup, dataSource);
  }
}
