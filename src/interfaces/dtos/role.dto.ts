import { PermissionScope } from "../../valueObjects";

export class addPermissionDto {
  //   roleId: string;
  resourceId: string;
  scopes: Array<PermissionScope>;
}
