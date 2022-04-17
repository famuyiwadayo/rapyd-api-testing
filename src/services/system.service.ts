import RoleService from "./role.service";
import { Resource } from "../entities/resource";
import { AvailableRole, Role } from "../entities/role";
import { AvailableResource } from "../entities/rolePermission";
import { DefaultAccessControls, PermissionScope } from "../valueObjects";

import consola from "consola";

import pullAll from "lodash/pullAll";
import isEmpty from "lodash/isEmpty";
import capitalize from "lodash/capitalize";

const roleService = new RoleService();
export default class SystemService {
  static async ensureResources() {
    const availableResources = Object.values(AvailableResource);

    const r = (await RoleService.getResourceByNames(availableResources)).map(
      (resource) => resource?.name
    );
    const rs = pullAll(availableResources, r as any);

    if (!isEmpty(rs)) {
      const toRun: any = [];
      availableResources.forEach((resource) =>
        toRun.push(roleService.createResource(resource))
      );
      const resources: Resource[] = await Promise.all(toRun);
      // console.log("RESOURCES", resources);
      return resources;
    }

    return [];
  }

  static async ensureRoles() {
    const availableRoles = Object.values(AvailableRole);

    const r = (await RoleService.getRoleBySlugs(availableRoles)).map(
      (role) => role?.name
    );
    const rs = pullAll(availableRoles, r as any);

    if (!isEmpty(rs)) {
      const toRun: any = [];
      availableRoles.forEach((role) =>
        toRun.push(roleService.createRole(role))
      );
      const roles: Role[] = await Promise.all(toRun);
      // console.log("ROLES", roles);
      return roles;
    }

    return [];
  }

  static async ensurePermissions(
    roleId: string,
    permissions: { name: AvailableResource; scopes: PermissionScope[] }[]
  ) {
    console.log("PERMISSIONS TO ENSURE", String(roleId), permissions);
    const toRun: any = [];

    const resources = await RoleService.getResourceByNames(
      permissions.map((p) => p.name)
    );

    const getResourceId = (resourceName: string) =>
      resources.find((r) => r.name === resourceName)?._id;

    if (!isEmpty(permissions)) {
      permissions.forEach((permission) => {
        const resourceId = getResourceId(permission.name);

        console.log("resourceId", String(resourceId));

        resourceId &&
          toRun.push(
            roleService.addPermission(String(roleId), {
              resourceId: String(resourceId),
              scopes: permission.scopes,
            })
          );
      });

      const result = await Promise.all(toRun);
      //   console.log("ADDED PERMISSIONS", result);
      return result;
    }

    return [];
  }

  static async ensureScopes(
    roleSlug: string,
    permissions: { name: AvailableResource; scopes: PermissionScope[] }[]
  ) {
    const toRun: any = [];

    const role = await RoleService.getRoleBySlug(roleSlug);
    const resources = await RoleService.getResourceByNames(
      permissions.map((p) => p.name)
    );
    const getResourceId = (resourceName: string) =>
      resources.find((r) => r.name === resourceName)?._id;

    if (role) {
      permissions.forEach((permission) => {
        const resourceId = getResourceId(permission.name);

        resourceId &&
          toRun.push(
            roleService.managePermissionScopes(
              String(role._id),
              String(resourceId),
              permission.scopes
            )
          );
      });

      const result = await Promise.all(toRun);
      return result;
    }

    return [];
  }

  async ensureSystemServices() {
    const toRun: any = [
      SystemService.ensureRoles(),
      SystemService.ensureResources(),
    ];

    const [roles] = await Promise.all(toRun);

    const defaultAccessControlRoles = Object.keys(DefaultAccessControls);
    const permissionsToEnsure: any[] = [];

    const getRoleId = (slug: string) =>
      (roles as Role[])?.find((role) => role.slug === slug)?._id;

    const unassignedRoles = (roles as Role[]).map((role) => role?.slug);

    if (!isEmpty(roles)) {
      unassignedRoles?.forEach(
        (role) =>
          role &&
          defaultAccessControlRoles.includes(role) &&
          permissionsToEnsure.push(
            SystemService.ensurePermissions(
              getRoleId(role)!,
              DefaultAccessControls[role].permissions
            )
          )
      );

      await Promise.all(permissionsToEnsure);
      // console.log("ADDED PERMISSION", result);
      unassignedRoles.forEach((role) => consola.success(capitalize(role)));
    } else {
      defaultAccessControlRoles.forEach((role) =>
        permissionsToEnsure.push(
          SystemService.ensureScopes(
            role,
            DefaultAccessControls[role].permissions
          )
        )
      );

      await Promise.all(permissionsToEnsure);
      defaultAccessControlRoles.forEach((role) =>
        consola.success(capitalize(role))
      );
      // console.log("ADDED PERMISSION", result);
    }

    // console.log("RESULT", roles, resources);
  }
}
