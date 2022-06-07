// @ts-nocheck

import { addPermissionDto } from "../interfaces/dtos";
import { createError, createSlug, getUpdateOptions } from "../utils";
import {
  permission,
  resource,
  Role,
  Permission,
  Resource,
  account,
  Account,
  role,
} from "../entities";
// import { Types } from "mongoose";
import { PermissionScope } from "../valueObjects";
import AuthService from "./auth.service";
import consola from "consola";

import uniq from "lodash/uniq";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import intersection from "lodash/intersection";

export default class RoleService {
  async createRole(name: string): Promise<Role> {
    if (!name) throw createError("Role name is required", 400);
    return (await role
      .findOneAndUpdate(
        { name },
        { name, slug: createSlug(name) },
        getUpdateOptions()
      )
      .lean()
      .exec()) as Role;
  }

  async assignRole(
    roleId: string,
    accountId: string,
    invalidateAuthCode = true
  ): Promise<Account> {
    invalidateAuthCode && (await AuthService.invalidateAuthCode(accountId));
    return (await account
      .findByIdAndUpdate(accountId, { $push: { roles: roleId } }, { new: true })
      .lean()
      .exec()) as Account;
  }

  async unassignRole(
    roleId: string,
    accountId: string,
    invalidateAuthCode = true
  ): Promise<Account> {
    invalidateAuthCode && (await AuthService.invalidateAuthCode(accountId));
    return (await account
      .findByIdAndUpdate(accountId, { $pull: { roles: roleId } }, { new: true })
      .lean()
      .exec()) as Account;
  }

  async managePermissionScopes(
    roleId: string,
    resourceId: string,
    scopes: PermissionScope[]
  ): Promise<Permission> {
    const _temp = (await permission
      .findOne({
        role: roleId,
        resource: resourceId,
      })
      .select("scopes")
      .lean()
      .exec()) as Partial<Permission>;

    // console.log(
    //   "INBOUND SCOPES",
    //   uniq(_temp?.scopes?.map((s) => s.name) ?? []),
    //   "\n"
    // );
    const newScopes = difference(
      scopes ?? [],
      uniq((_temp?.scopes ?? [])?.map((s) => s.name))
    );

    const deletedScopes = difference(
      uniq((_temp?.scopes ?? [])?.map((s) => s.name)),
      scopes ?? []
    );
    // console.log("INCOMING SCOPES", newScopes);
    // console.log("DELETED SCOPES", deletedScopes, "\n");

    if (!isEmpty(deletedScopes)) {
      const toRemove: any = [];
      deletedScopes.map((scope) =>
        toRemove.push(this.revokePermissionScope(roleId, resourceId, scope))
      );
      await Promise.all(toRemove);
    }

    if (!isEmpty(newScopes)) {
      return (await permission
        .findOneAndUpdate(
          { role: roleId, resource: resourceId },
          {
            role: roleId,
            resource: resourceId,
            $push: {
              scopes: { $each: newScopes.map((scope) => ({ name: scope })) },
            },
          },
          getUpdateOptions()
        )
        .lean()
        .exec()) as Permission;
    } else {
      return _temp;
    }
  }

  async addPermissionScopes(
    roleId: string,
    resourceId: string,
    scopes: PermissionScope[]
  ): Promise<Permission> {
    const _temp = (await permission
      .findOne({
        role: roleId,
        resource: resourceId,
      })
      .lean()
      .exec()) as Permission;

    const newScopes = difference(
      scopes ?? [],
      uniq((_temp?.scopes ?? [])?.map((s) => s.name))
    );
    // console.log("INCOMING SCOPES", newScopes);

    if (!isEmpty(newScopes)) {
      return (await permission
        .findOneAndUpdate(
          { role: roleId, resource: resourceId },
          {
            role: roleId,
            resource: resourceId,
            $push: {
              scopes: { $each: newScopes.map((scope) => ({ name: scope })) },
            },
          },
          getUpdateOptions()
        )
        .lean()
        .exec()) as Permission;
    } else {
      return _temp;
    }
  }

  async revokePermissionScope(
    roleId: string,
    resourceId: string,
    scope: PermissionScope
  ): Promise<Permission> {
    return (await permission
      .findOneAndUpdate(
        { role: roleId, resource: resourceId },
        { $pull: { scopes: { name: scope } } },
        { new: true }
      )
      .lean()
      .exec()) as Permission;
  }

  async addPermission(
    roleId: string,
    input: addPermissionDto
  ): Promise<Permission> {
    const { resourceId, scopes } = input;
    if ((await resource.countDocuments({ _id: resourceId })) < 1)
      throw createError("Resource not found", 404);
    if ((await role.countDocuments({ _id: roleId })) < 1)
      throw createError("Role not found", 404);

    return (await permission
      .findOneAndUpdate(
        {
          resource: resourceId,
          role: roleId,
        },
        {
          role: roleId,
          resource: resourceId,
          scopes: scopes.map((scope) => ({ name: scope })),
        },
        getUpdateOptions()
      )
      .lean()
      .exec()) as Permission;
  }

  async revokePermission(
    roleId: string,
    resourceId: string
  ): Promise<Permission> {
    if ((await role.countDocuments({ _id: roleId })) < 1)
      throw createError("Role not found", 404);
    return (await permission
      .findOneAndDelete({ resource: resourceId, role: roleId })
      .lean()
      .exec()) as Permission;
  }

  async getPermissions(roleId: string): Promise<Permission[]> {
    return (await permission
      .find({ role: roleId })
      .populate(["resource"])
      .lean()
      .exec()) as Permission[];
  }

  async createResource(value: string): Promise<Resource> {
    if (!value) throw createError("Resource name is required", 400);
    const name = createSlug(value);
    return (await resource
      .findOneAndUpdate({ name }, { name }, getUpdateOptions())
      .lean()
      .exec()) as Resource;
  }

  async getResources(): Promise<Resource[]> {
    return (await resource.find().lean().exec()) as Resource[];
  }

  async deleteResource(id: string): Promise<Resource[]> {
    return (await resource
      .deleteOne({ _id: id }, { new: true })
      .lean()
      .exec()) as Resource[];
  }

  async getRoles(): Promise<Role[]> {
    return (await role.find().lean().exec()) as Role[];
  }

  static async getResourceByName(name: string): Promise<Resource> {
    const res = (await resource.findOne({ name }).lean().exec()) as Resource;
    if (!res) throw createError("Resource not found", 404);
    return res;
  }

  static async getResourceByNames(names: string[]): Promise<Resource[]> {
    const res = (await resource
      .find({ name: { $in: names } })
      .lean()
      .exec()) as Resource[];

    // if (!res) throw createError("Resource not found", 404);
    return res;
  }

  static async getRoleBySlug(slug: string): Promise<Role> {
    const res = (await role.findOne({ slug }).lean().exec()) as Role;
    if (!res) throw createError("Role not found", 404);
    return res;
  }

  static async getRoleBySlugs(slugs: string[]): Promise<Role[]> {
    const res = (await role
      .find({ slug: { $in: slugs } })
      .lean()
      .exec()) as Role[];
    return res;
  }

  static async getRoleById(id: string, dryRun = false): Promise<Role> {
    const res = (await role.findById(id).lean().exec()) as Role;
    if (!res && !dryRun) throw createError("Role not found", 404);
    return res;
  }

  static async getRoleByIds(ids: string[]): Promise<Role[]> {
    const res = (await role
      .find({ _id: { $in: ids } })
      .lean()
      .exec()) as Role[];
    return res;
  }

  private static async _requiresPermission(
    requiredRoleSlug: string,
    roles: string[],
    resourceName: string,
    scopes: PermissionScope[]
  ): Promise<boolean> {
    const toRun = [
      RoleService.getResourceByName(resourceName),
      RoleService.getRoleBySlug(requiredRoleSlug),
    ];
    const result = await Promise.all(toRun);
    return Boolean(
      (await permission
        .countDocuments({
          role: result[1]._id,
          resource: result[0]._id,
          "scopes.name": { $in: scopes },
        })
        .lean()
        .exec()) && roles?.includes(String(result[1]._id))
    );
  }

  private static async _checkPermission(
    roleId: string,
    resourceName: string,
    scopes: PermissionScope[]
  ): Promise<boolean> {
    const res = await RoleService.getResourceByName(resourceName);
    return Boolean(
      await permission
        .countDocuments({
          role: roleId,
          resource: res._id,
          "scopes.name": { $in: scopes },
        })
        .lean()
        .exec()
    );
  }

  static async requiresPermission(
    requiredRoleSlugs: string[],
    roles: string[],
    resourceName: string,
    scopes: PermissionScope[]
  ): Promise<void> {
    const toRunInParallel: any[] = [];
    requiredRoleSlugs?.forEach((requiredRole) =>
      toRunInParallel.push(
        RoleService._requiresPermission(
          requiredRole,
          roles,
          resourceName,
          scopes
        )
      )
    );
    const result = (await Promise.all(toRunInParallel)).filter(Boolean);
    if (result[0] !== true) throw createError("Access denied", 401);
    consola.success("✅ Access granted");
    return;
  }

  static async hasPermission(
    roles: string[],
    resourceName: string,
    scopes: PermissionScope[]
  ): Promise<void> {
    const toRunInParallel: any[] = [];
    roles.forEach((role) =>
      toRunInParallel.push(
        RoleService._checkPermission(role, resourceName, scopes)
      )
    );
    const result = (await Promise.all(toRunInParallel)).filter(Boolean);
    if (result[0] !== true) throw createError("Access denied", 401);
    consola.success("✅ Access granted");
    return;
  }

  static async hasOneOrMore(
    roles: AvailableRole[],
    roleIds: string[]
  ): Promise<boolean> {
    const _roles = await RoleService.getRoleBySlugs(
      roles.map((role) => String(role).toString())
    );

    const _intersect = intersection(
      roleIds,
      _roles?.map((role) => String(role?._id))
    );

    return !isEmpty(_intersect);
  }
}
