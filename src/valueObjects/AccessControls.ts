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
        name: AvailableResource.ONBOARDING,
        scopes: [
          PermissionScope.CREATE,
          PermissionScope.READ,
          PermissionScope.UPDATE,
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
        name: AvailableResource.ONBOARDING,
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
        name: AvailableResource.ONBOARDING,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.ROLE,
        scopes: [PermissionScope.ALL],
      },
    ],
  },
};

export default defaultAccessControls;
