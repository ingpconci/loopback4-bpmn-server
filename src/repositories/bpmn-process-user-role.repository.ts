import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import { TenantTableFilterRepository } from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessUserRole, BpmnProcessUserRoleRelations, BpmnProcessUserRoleHasUser, BpmnProcessUserRoleHasBpmnProcessModel, BpmnProcessUserRoleGroup} from '../models';
import {BpmnProcessUserRoleHasUserRepository} from './bpmn-process-user-role-has-user.repository';
import {BpmnProcessUserRoleHasBpmnProcessModelRepository} from './bpmn-process-user-role-has-bpmn-process-model.repository';
import {BpmnProcessUserRoleGroupRepository} from './bpmn-process-user-role-group.repository';

export class BpmnProcessUserRoleRepository extends TenantTableFilterRepository<
  BpmnProcessUserRole,
  typeof BpmnProcessUserRole.prototype.id,
  BpmnProcessUserRoleRelations
> {

  public readonly bpmnProcessUserRoleHasUsers: HasManyRepositoryFactory<BpmnProcessUserRoleHasUser, typeof BpmnProcessUserRole.prototype.id>;

  public readonly bpmnProcessUserRoleHasBpmnProcessModels: HasManyRepositoryFactory<BpmnProcessUserRoleHasBpmnProcessModel, typeof BpmnProcessUserRole.prototype.id>;

  public readonly bpmnProcessUserRoleGroup: BelongsToAccessor<BpmnProcessUserRoleGroup, typeof BpmnProcessUserRole.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: BpmnServerDataSource, @repository.getter('BpmnProcessUserRoleHasUserRepository') protected bpmnProcessUserRoleHasUserRepositoryGetter: Getter<BpmnProcessUserRoleHasUserRepository>, @repository.getter('BpmnProcessUserRoleHasBpmnProcessModelRepository') protected bpmnProcessUserRoleHasBpmnProcessModelRepositoryGetter: Getter<BpmnProcessUserRoleHasBpmnProcessModelRepository>, @repository.getter('BpmnProcessUserRoleGroupRepository') protected bpmnProcessUserRoleGroupRepositoryGetter: Getter<BpmnProcessUserRoleGroupRepository>,
  ) {
    super(BpmnProcessUserRole, dataSource);
    this.bpmnProcessUserRoleGroup = this.createBelongsToAccessorFor('bpmnProcessUserRoleGroup', bpmnProcessUserRoleGroupRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessUserRoleGroup', this.bpmnProcessUserRoleGroup.inclusionResolver);
    this.bpmnProcessUserRoleHasBpmnProcessModels = this.createHasManyRepositoryFactoryFor('bpmnProcessUserRoleHasBpmnProcessModels', bpmnProcessUserRoleHasBpmnProcessModelRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessUserRoleHasBpmnProcessModels', this.bpmnProcessUserRoleHasBpmnProcessModels.inclusionResolver);
    this.bpmnProcessUserRoleHasUsers = this.createHasManyRepositoryFactoryFor('bpmnProcessUserRoleHasUsers', bpmnProcessUserRoleHasUserRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessUserRoleHasUsers', this.bpmnProcessUserRoleHasUsers.inclusionResolver);
  }
}
