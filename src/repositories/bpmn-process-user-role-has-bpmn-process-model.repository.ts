import {inject, Getter} from '@loopback/core';
import {TenantTableFilterRepository} from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessUserRoleHasBpmnProcessModel, BpmnProcessUserRoleHasBpmnProcessModelRelations, BpmnProcessModel, BpmnProcessUserRole} from '../models';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {BpmnProcessModelRepository} from './bpmn-process-model.repository';
import { BpmnProcessUserRoleRepository } from './bpmn-process-user-role.repository';

export class BpmnProcessUserRoleHasBpmnProcessModelRepository extends TenantTableFilterRepository<
  BpmnProcessUserRoleHasBpmnProcessModel,
  typeof BpmnProcessUserRoleHasBpmnProcessModel.prototype.id,
  BpmnProcessUserRoleHasBpmnProcessModelRelations
> {

  public readonly bpmnProcessModel: BelongsToAccessor<BpmnProcessModel, typeof BpmnProcessUserRoleHasBpmnProcessModel.prototype.id>;
  public readonly bpmnProcessUserRole: BelongsToAccessor<BpmnProcessUserRole, typeof BpmnProcessUserRoleHasBpmnProcessModel.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource, 
    @repository.getter('BpmnProcessModelRepository') protected bpmnProcessModelRepositoryGetter: Getter<BpmnProcessModelRepository>,
    @repository.getter('BpmnProcessUserRoleRepository') protected bpmnProcessUserRoleRepositoryGetter: Getter<BpmnProcessUserRoleRepository>,
  ) {
    super(BpmnProcessUserRoleHasBpmnProcessModel, dataSource);
    
    this.bpmnProcessModel = this.createBelongsToAccessorFor('bpmnProcessModel', bpmnProcessModelRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessModel', this.bpmnProcessModel.inclusionResolver);

    this.bpmnProcessUserRole = this.createBelongsToAccessorFor('bpmnProcessUserRole', bpmnProcessUserRoleRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessUserRole', this.bpmnProcessUserRole.inclusionResolver);
    
  }
}
