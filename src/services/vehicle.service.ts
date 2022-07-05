import RoleService from "./role.service";
import { PermissionScope } from "../valueObjects";
import {
  CreateVehicleColorDto,
  CreateVehicleDto,
  CreateVehicleFeatureDto,
  CreateVehicleTypeDto,
  UpdateVehicleDto,
} from "../interfaces/dtos";
import {
  vehicle,
  Vehicle,
  VehicleColor,
  VehicleFeature,
  AvailableResource,
  AvailableRole,
  VehicleImage,
  vehicleColor,
  vehicleFeature,
  VehicleType,
  vehicleType,
} from "../entities";
import AuthVerificationService from "./authVerification.service";
import AccessService from "./access.service";
import { createError, createSlug, getUpdateOptions, paginate, validateFields } from "../utils";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";

import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import difference from "lodash/difference";
import { toLower } from "lodash";
// import { uniqBy } from "lodash";

export default class VehicleService {
  async getVehicles(
    roles: string[],
    filters: IPaginationFilter & {
      fuelType?: string[];
      features?: string[]; // coma separated string of vehicle feature _ids
      gearbox?: string[];
      color?: string[]; // coma separated string of vehicle color _ids
      make?: string[];
      model?: string[];
      year?: string; // hypen separated string of year, 2000 - 20222
      searchPhrase?: string;
      mileage?: string;
    },
    dryRun?: boolean
  ): Promise<PaginatedDocument<Vehicle[]>> {
    if (!dryRun)
      await RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
        roles,
        AvailableResource.VEHICLE,
        [PermissionScope.READ, PermissionScope.ALL]
      );

    const makes = String(filters?.make ?? "").split(",");
    const models = String(filters?.model ?? "").split(",");
    const colors = String(filters?.color ?? "").split(",");
    const fuels = String(filters?.fuelType ?? "").split(",");
    const gearboxs = String(filters?.gearbox ?? "").split(",");
    const features = String(filters?.features ?? "").split(",");
    const [fromYear, toYear] = String(filters?.year ?? "")
      .split("-")
      .map((v) => String(v).trim());
    const [fromMile, toMile] = String(filters?.mileage ?? "")
      .split("-")
      .map((v) => String(v).trim());

    // ?color=626797ee8bb9cffc216a2474,626673a78bb9cffc211a69a9&features=626796f48bb9cffc2169e3d0

    let queries: { $and?: any[]; $text?: { $search: string } } = {};
    // let population: any[] = ["color"];

    if (filters?.fuelType) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({ $or: fuels.map((fuel) => ({ fuelType: fuel })) });
    }
    if (filters?.gearbox) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({ $or: gearboxs.map((box) => ({ gearBox: box })) });
    }
    if (filters?.color) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: colors.map((color) => ({ color })),
      });
    }
    if (filters?.features) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        features: { $in: features },
      });
      //   population.push({ path: "features", match: { slug: { $in: features } } });
    }
    if (filters?.make) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: makes.map((make) => ({
          make: { $regex: new RegExp(make, "i") },
        })),
      });
    }
    if (filters?.model) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: models.map((model) => ({
          model: { $regex: new RegExp(model, "i") },
        })),
      });
    }
    if (filters?.year) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        year: { $gte: fromYear, $lte: toYear },
      });
    }
    if (filters?.mileage) {
      queries = { $and: [...(queries?.$and ?? [])] };
      if (fromMile && toMile) {
        queries.$and!.push({
          mileage: { $gte: fromMile, $lte: toMile },
        });
      }
      if (fromMile && !toMile) {
        queries.$and!.push({
          mileage: { $lte: fromMile },
        });
      }
    }

    if (filters?.searchPhrase) {
      queries.$text = { $search: filters.searchPhrase };
    }

    // console.log(JSON.stringify({ filters }));

    return await paginate("vehicle", queries, filters, {
      populate: ["features", "color", "type"],
    });
  }

  async getAvailableVehicleMakes(roles: string[]) {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    return await vehicle.aggregate([{ $group: { _id: "$make" } }]).exec();
  }

  async getAvailableVehicleMakeModel(make: string, roles: string[]) {
    if (!make) throw createError("make param is required", 400);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    return await vehicle
      .aggregate([{ $match: { make: { $regex: new RegExp(toLower(make), "i") } } }, { $group: { _id: "$model" } }])
      .exec();
  }

  async getVehicleById(vehicleId: string, roles: string[]): Promise<Vehicle> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _vehicle = await vehicle.findById(vehicleId).populate(["features", "color", "type"]).lean<Vehicle>().exec();
    if (!_vehicle) throw createError("Vehicle not found", 404);
    return _vehicle;
  }

  async getSimilarVehicles(vehicleId: string, roles: string[]): Promise<Vehicle[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _vehicle = await vehicle.findById(vehicleId).lean<Vehicle>().exec();

    if (!_vehicle) throw createError("Vehicle not found", 404);
    const similarVehicles = await this.getVehicles(
      roles,
      {
        limit: "10",
        features: _vehicle.features as string[],
        make: [_vehicle?.make],
        // model: [_vehicle?.model],
        gearbox: [_vehicle?.gearBox],
        fuelType: [_vehicle?.fuelType],
      },
      true
    );
    return similarVehicles?.data;
  }

  async getVehicleColors(roles: string[]): Promise<VehicleColor[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await vehicleColor.find().lean<VehicleColor[]>().exec();
  }

  async getVehicleTypes(roles: string[]): Promise<VehicleType[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await vehicleType.find().lean<VehicleType[]>().exec();
  }

  async getVehicleFeatures(roles: string[]): Promise<VehicleFeature[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await vehicleFeature.find().lean<VehicleFeature[]>();
  }

  async createVehicle(input: CreateVehicleDto, roles: string[]): Promise<Vehicle> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);

    if (input?.images && typeof input.images[0] === "string")
      input.images = VehicleService.transformImageStrings(input?.images as string[]);

    const _vehicle = (await vehicle.create({
      ...input,
      rapydId: AuthVerificationService.generateCode(),
    })) as Vehicle;
    return _vehicle;
  }

  async createVehicleColor(input: CreateVehicleColorDto, roles: string[]): Promise<VehicleColor> {
    validateFields(input, ["color"]);

    const slug = createSlug(input?.color);
    return (await VehicleService.createOrUpdateVehicleProperty("vehicleColor", slug, input, roles)) as VehicleColor;
  }

  async createVehicleType(input: CreateVehicleTypeDto, roles: string[]): Promise<VehicleType> {
    validateFields(input, ["name"]);

    const slug = createSlug(input?.name);
    return (await VehicleService.createOrUpdateVehicleProperty("vehicleType", slug, input, roles)) as VehicleType;
  }

  async createVehicleFeature(input: CreateVehicleFeatureDto, roles: string[]): Promise<VehicleFeature> {
    validateFields(input, ["name"]);
    const slug = createSlug(input?.name);
    return (await VehicleService.createOrUpdateVehicleProperty("vehicleFeature", slug, input, roles)) as VehicleFeature;
  }

  async updateVehicle(vehicleId: string, input: UpdateVehicleDto, roles: string[]): Promise<Vehicle> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.UPDATE,
      PermissionScope.ALL,
    ]);

    if (input.deleteImages && !isEmpty(input?.deleteImages)) {
      await VehicleService.removeVehicleImages(vehicleId, input.deleteImages);
      delete input.deleteImages;
    }

    let _vehicle = await vehicle.findById(vehicleId).lean<Vehicle>().exec();

    if (input?.images && typeof input.images[0] === "string") {
      const newImages = VehicleService.treatIncomingVehicleImages(
        _vehicle?.images,
        uniq(
          difference(
            input?.images as string[],
            (_vehicle?.images ?? [])?.map((i) => (i?.metadata?.isCover ? `${i?.url}?cover=true` : i?.url))
          )
        )
      );

      //   console.log(newImages);
      input.images = !isEmpty(newImages) ? newImages : _vehicle?.images;
    }

    if (input?.features && !isEmpty(input?.features))
      input.features = uniq([...(_vehicle?.features as string[]), ...input?.features]);

    _vehicle = await vehicle
      .findByIdAndUpdate(vehicleId, { ...input }, { new: true })
      .lean<Vehicle>()
      .exec();
    return _vehicle;
  }

  async updateVehicleColor(slug: string, input: Partial<CreateVehicleColorDto>, roles: string[]): Promise<VehicleColor> {
    return (await VehicleService.createOrUpdateVehicleProperty(
      "vehicleColor",
      slug,
      { ...input, slug: input?.color ? createSlug(input?.color) : slug },
      roles
    )) as VehicleColor;
  }

  async updateVehicleType(slug: string, input: Partial<CreateVehicleTypeDto>, roles: string[]): Promise<VehicleType> {
    return (await VehicleService.createOrUpdateVehicleProperty(
      "vehicleType",
      slug,
      { ...input, slug: input?.name ? createSlug(input?.name) : slug },
      roles
    )) as VehicleType;
  }

  async updateVehicleFeature(slug: string, input: Partial<CreateVehicleFeatureDto>, roles: string[]): Promise<VehicleFeature> {
    return (await VehicleService.createOrUpdateVehicleProperty(
      "vehicleFeature",
      slug,
      { ...input, slug: input?.name ? createSlug(input?.name) : slug },
      roles
    )) as VehicleFeature;
  }

  async deleteVehicle(vehicleId: string, roles: string[]): Promise<Vehicle> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.DELETE,
      PermissionScope.ALL,
    ]);

    const _vehicle = await vehicle.findByIdAndDelete(vehicleId).lean<Vehicle>().exec();
    if (!_vehicle) throw createError("Vehicle not found", 404);
    return _vehicle;
  }

  async deleteVehicleType(vehicleTypeId: string, roles: string[]): Promise<VehicleType> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.DELETE,
      PermissionScope.ALL,
    ]);

    const _vehicleType = await vehicleType.findByIdAndDelete(vehicleTypeId).lean<VehicleType>().exec();
    if (!_vehicleType) throw createError("Vehicle type not found", 404);
    return _vehicleType;
  }

  async deleteVehicleColor(vehicleColorId: string, roles: string[]): Promise<VehicleColor> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.DELETE,
      PermissionScope.ALL,
    ]);

    const _vehicleColor = await vehicleColor.findByIdAndDelete(vehicleColorId).lean<VehicleColor>().exec();
    if (!_vehicleColor) throw createError("Vehicle color not found", 404);
    return _vehicleColor;
  }

  async deleteVehicleFeature(vehicleFeatureId: string, roles: string[]): Promise<VehicleFeature> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.DELETE,
      PermissionScope.ALL,
    ]);

    const _vehicleFeature = await vehicleFeature.findByIdAndDelete(vehicleFeatureId).lean<VehicleFeature>().exec();
    if (!_vehicleFeature) throw createError("Vehicle feature not found", 404);
    return _vehicleFeature;
  }

  // performance can be improved later.
  protected static treatIncomingVehicleImages(dbImages: VehicleImage[], newImages: string[]): VehicleImage[] {
    // If a vehicle image in the db is already set to cover, and there's an incoming image
    // that needs to be set to cover, remove the already existing cover image, and add it
    // back as part of the incoming images, then the transformImageString method will handle the rest.

    const newCoverImage = newImages.find((url) => url.includes("?cover=true"))?.split("?")[0];
    if (newCoverImage && dbImages?.map((v) => v.url).includes(newCoverImage))
      dbImages = dbImages.filter((v) => v.url !== newCoverImage);

    const oldCoverImage = dbImages.find((v) => v?.metadata?.isCover === true);
    if (newCoverImage && !!oldCoverImage) {
      const oldImages = (dbImages as VehicleImage[]).filter((v) => v?._id !== oldCoverImage?._id);
      const neew = VehicleService.transformImageStrings([...newImages, oldCoverImage.url]);
      return [...oldImages, ...neew];
    }

    return [...dbImages, ...VehicleService.transformImageStrings(newImages as string[])];
  }

  protected static async removeVehicleImages(vehicleId: string, imageIds: string[], dryRun = true) {
    const result = await vehicle
      .findByIdAndUpdate(vehicleId, { $pull: { images: { _id: { $in: imageIds } } } }, { new: true })
      .lean<Vehicle>()
      .exec();
    if (!result && !dryRun) throw createError("Failed to remove vehicle images", 400);
    return result;
  }

  protected static transformImageStrings(images: string[]): VehicleImage[] {
    // console.log(images);
    return images.filter(Boolean).map((image) => {
      const [img, query] = image.split("?");
      if (query === "cover=true") {
        return {
          url: img,
          metadata: {
            isCover: true,
          },
        } as VehicleImage;
      }

      return { url: image } as VehicleImage;
    });
  }

  protected static async createOrUpdateVehicleProperty<T>(
    entity: "vehicleColor" | "vehicleFeature" | "vehicleType",
    slug: string,
    input: T,
    roles: string[]
  ): Promise<VehicleColor | VehicleFeature> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.VEHICLE, [
      PermissionScope.CREATE,
      PermissionScope.UPDATE,
      PermissionScope.ALL,
    ]);

    const _property = await AccessService.getModel(entity)
      .findOneAndUpdate({ slug }, { ...input }, getUpdateOptions())
      .lean()
      .exec();
    if (!_property) throw createError(`Operation failed: unable to create/update ${entity}`, 400);
    return _property;
  }

  static async checkVehicleExists(id: string): Promise<boolean> {
    const count = await vehicle.countDocuments({ _id: id }).exec();
    return count > 0;
  }
}

// https://images.rapyd-api.com/userA.png?cover=true
