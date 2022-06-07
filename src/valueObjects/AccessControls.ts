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
        name: AvailableResource.VEHICLE,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.COMPLAINT,
        scopes: [
          PermissionScope.READ,
          PermissionScope.CREATE,
          PermissionScope.UPDATE,
          PermissionScope.DELETE,
        ],
      },
      {
        name: AvailableResource.COMPLAINT_FEEDBACK,
        scopes: [PermissionScope.READ],
      },
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
      {
        name: AvailableResource.PAYMENT_ITEM,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.SERVICING,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.LOAN,
        scopes: [PermissionScope.READ, PermissionScope.REQUEST],
      },
      {
        name: AvailableResource.GUARANTOR,
        scopes: [
          PermissionScope.READ,
          PermissionScope.UPDATE,
          PermissionScope.CREATE,
          PermissionScope.DELETE,
        ],
      },
    ],
  },
  moderator: {
    permissions: [
      {
        name: AvailableResource.VEHICLE,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.COMPLAINT,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.COMPLAINT_FEEDBACK,
        scopes: [
          PermissionScope.READ,
          PermissionScope.CREATE,
          PermissionScope.UPDATE,
          PermissionScope.DELETE,
        ],
      },
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
      {
        name: AvailableResource.PAYMENT_ITEM,
        scopes: [PermissionScope.READ],
      },
      {
        name: AvailableResource.SERVICING,
        scopes: [PermissionScope.READ, PermissionScope.UPDATE],
      },
      {
        name: AvailableResource.LOAN,
        scopes: [PermissionScope.READ, PermissionScope.UPDATE],
      },
      {
        name: AvailableResource.GUARANTOR,
        scopes: [
          PermissionScope.READ,
          PermissionScope.UPDATE,
          PermissionScope.CREATE,
          PermissionScope.DELETE,
        ],
      },
    ],
  },
  superadmin: {
    permissions: [
      {
        name: AvailableResource.COMPLAINT_FEEDBACK,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.VEHICLE,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.COMPLAINT,
        scopes: [PermissionScope.ALL],
      },
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
      {
        name: AvailableResource.PAYMENT_ITEM,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.SERVICING,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.LOAN,
        scopes: [PermissionScope.ALL],
      },
      {
        name: AvailableResource.GUARANTOR,
        scopes: [PermissionScope.ALL],
      },
    ],
  },
};

export default defaultAccessControls;
