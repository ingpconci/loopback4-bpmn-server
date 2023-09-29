CREATE TABLE "bpmnProcessInstance" (
  "id" varchar(128) NOT NULL,
  "parentItemId" varchar(128),
  "counter" serial4,
  "name" varchar(255) NOT NULL,
  "status" varchar(255),
  "startedAt" timestamptz,
  "endedAt" timestamptz,
  "savedAt" timestamptz,
  "source" text,
  "data" json,
  "items" json,
  "tokens" json,
  "loops" json,
  "logs" json,
  "tenantId" int4,
  "note" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "bpmnProcessInstanceHasUserTask" (
  "id" serial4,
  "tenantId" int4,
  "bpmnProcessInstanceId" varchar(36) NOT NULL,
  "taskId" varchar(36) NOT NULL,
  "taskElementId" varchar(36) NOT NULL,
  "bpmnProcessUserRoleName" varchar(45),
  PRIMARY KEY ("id")
);

CREATE TABLE "bpmnProcessModel" (
  "id" serial4,
  "name" varchar(255) NOT NULL,
  "sourceXmlData" text,
  "sourceFileName" varchar(255),
  "sourceFileProperties" json,
  "svg" text,
  "processes" json,
  "events" json,
  "savedAt" timestamptz,
  "tenantId" int4,
  PRIMARY KEY ("name"),
  CONSTRAINT "unique_bpmnProcessModel1" UNIQUE ("id")
);

CREATE TABLE "bpmnProcessUserRole" (
  "id" serial4,
  "tenantId" int4,
  "bpmnProcessUserRoleGroupId" int4,
  "name" varchar(45) NOT NULL,
  "description" varchar(255),
  "note" text,
  "propertiesJson" json,
  "processVariableToFilterAssignedUsers" varchar(255),
  "processVariableToGetAssignedUserId" varchar(255),
  PRIMARY KEY ("id"),
  CONSTRAINT "bpmn_process_user_role_unique_name" UNIQUE ("name")
);

CREATE TABLE "bpmnProcessUserRoleGroup" (
  "id" serial4,
  "tenantId" int4,
  "name" varchar(45) NOT NULL,
  "description" varchar(255),
  "note" text,
  "propertiesJson" json,
  PRIMARY KEY ("id"),
  CONSTRAINT "unique_bpmnProcessUserRoleGroup_name" UNIQUE ("name")
);

CREATE TABLE "bpmnProcessUserRoleHasBpmnProcessModel" (
  "id" serial4,
  "bpmnProcessUserRole_id" int4 NOT NULL,
  "bpmnProcessModel_id" int4 NOT NULL,
  "tenantId" int4 NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "bpmnProcessUserRoleHasUser" (
  "id" serial4,
  "tenantId" int4,
  "bpmnProcessUserRole_id" int4 NOT NULL,
  "user_id" int4 NOT NULL,
  "assignedUserFilterValueNumber" int4,
  PRIMARY KEY ("id")
);

ALTER TABLE "bpmnProcessInstance" ADD CONSTRAINT "fk_bpmnProcessInstance_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessInstanceHasUserTask" ADD CONSTRAINT "fk_bpmnProcessInstanceHasUserTask_bpmnProcessInstance_1" FOREIGN KEY ("bpmnProcessInstanceId") REFERENCES "bpmnProcessInstance" ("id");
ALTER TABLE "bpmnProcessInstanceHasUserTask" ADD CONSTRAINT "fk_bpmnProcessInstanceHasUserTask_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessModel" ADD CONSTRAINT "fk_bpmnProcessModel_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessUserRole" ADD CONSTRAINT "fk_bpmnProcessUserRole_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessUserRole" ADD CONSTRAINT "fk_bpmnProcessUserRole_bpmnProcessUserRoleGroup_1" FOREIGN KEY ("bpmnProcessUserRoleGroupId") REFERENCES "bpmnProcessUserRoleGroup" ("id");
ALTER TABLE "bpmnProcessUserRoleGroup" ADD CONSTRAINT "fk_bpmnProcessUserRoleGroup_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessUserRoleHasBpmnProcessModel" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasBpmnProcessModel_bpmnProcessUserRole_1" FOREIGN KEY ("bpmnProcessUserRole_id") REFERENCES "bpmnProcessUserRole" ("id");
ALTER TABLE "bpmnProcessUserRoleHasBpmnProcessModel" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasBpmnProcessModel_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");
ALTER TABLE "bpmnProcessUserRoleHasBpmnProcessModel" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasBpmnProcessModel_bpmnProcessModel_1" FOREIGN KEY ("bpmnProcessModel_id") REFERENCES "bpmnProcessModel" ("id");
ALTER TABLE "bpmnProcessUserRoleHasUser" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasUser_bpmnProcessUserRole_1" FOREIGN KEY ("bpmnProcessUserRole_id") REFERENCES "bpmnProcessUserRole" ("id");
/*ALTER TABLE "bpmnProcessUserRoleHasUser" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasUser_user_1" FOREIGN KEY ("user_id") REFERENCES "user" ("id");*/
ALTER TABLE "bpmnProcessUserRoleHasUser" ADD CONSTRAINT "fk_bpmnProcessUserRoleHasUser_tenant_1" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id");

