import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import { TenantTableFilterRepository } from 'loopback4-tenant-table-filter';
import {BpmnServerDataSource} from '../datasources';
import {BpmnProcessUserRoleHasUser, BpmnProcessUserRoleHasUserRelations, BpmnProcessUserRole, User} from '../models';
import {BpmnProcessUserRoleRepository} from './bpmn-process-user-role.repository';
import {UserRepository} from './user.repository';

export class BpmnProcessUserRoleHasUserRepository extends TenantTableFilterRepository<
  BpmnProcessUserRoleHasUser,
  typeof BpmnProcessUserRoleHasUser.prototype.id,
  BpmnProcessUserRoleHasUserRelations
> {

  public readonly bpmnProcessUserRole: BelongsToAccessor<BpmnProcessUserRole, typeof BpmnProcessUserRoleHasUser.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof BpmnProcessUserRoleHasUser.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource:BpmnServerDataSource, 
    @repository.getter('BpmnProcessUserRoleRepository') protected bpmnProcessUserRoleRepositoryGetter: Getter<BpmnProcessUserRoleRepository>, 
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(BpmnProcessUserRoleHasUser, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.bpmnProcessUserRole = this.createBelongsToAccessorFor('bpmnProcessUserRole', bpmnProcessUserRoleRepositoryGetter,);
    this.registerInclusionResolver('bpmnProcessUserRole', this.bpmnProcessUserRole.inclusionResolver);
  }
}
