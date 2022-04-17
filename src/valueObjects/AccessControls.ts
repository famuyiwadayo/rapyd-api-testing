import PermissionScope from "./Scopes";
import { AvailableResource } from "../entities/rolePermission";

export type AccessControlType = {
  [key: string]: {
    permissions: {
      name: AvailableResource;
      scopes: PermissionScope[];
    }[];
  };
};

const defaultAccessControls: AccessControlType = {
  driver: {
    permissions: [
      {
        name: AvailableResource.ACCOUNT,
        scopes: [
          PermissionScope.READ,
          PermissionScope.UPDATE,
          PermissionScope.VERIFY,
        ],
      },
      {
        name: AvailableResource.VOTE,
        scopes: [PermissionScope.VOTE],
      },
      {
        name: AvailableResource.EARNING,
        scopes: [
          PermissionScope.EARN,
          PermissionScope.REDEEM,
          PermissionScope.READ,
        ],
      },
    ],
  },
  moderator: {
    permissions: [
      {
        name: AvailableResource.ACCOUNT,
        scopes: [
          PermissionScope.READ,
          PermissionScope.UPDATE,
          PermissionScope.VERIFY,
        ],
      },
      {
        name: AvailableResource.COIN,
        scopes: [
          PermissionScope.CREATE,
          PermissionScope.READ,
          PermissionScope.UPDATE,
        ],
      },
    ],
  },
  superadmin: {
    permissions: [
      {
        name: AvailableResource.ACCOUNT,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.COIN,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.ROLE,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.VOTE,
        scopes: [PermissionScope.ALL],
      },
    ],
  },
};

export default defaultAccessControls;
