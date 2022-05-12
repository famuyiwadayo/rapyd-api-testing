import RoleService from "./role.service";
import { PermissionScope } from "../valueObjects";
import {
  CreateCarColorDto,
  CreateCarDto,
  CreateCarFeatureDto,
  UpdateCarDto,
} from "../interfaces/dtos";
import {
  car,
  Car,
  CarColor,
  CarFeature,
  AvailableResource,
  AvailableRole,
  CarImage,
  carColor,
  carFeature,
} from "../entities";
import AuthVerificationService from "./authVerification.service";
import AccessService from "./access.service";
import {
  createError,
  createSlug,
  getUpdateOptions,
  paginate,
  validateFields,
} from "../utils";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";

import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import difference from "lodash/difference";
// import { uniqBy } from "lodash";

export default class CarService {
  async getCars(
    roles: string[],
    filters: IPaginationFilter & {
      fuelType?: string[];
      features?: string[]; // coma separated string of car feature _ids
      gearbox?: string[];
      color?: string[]; // coma separated string of car color _ids
      make?: string[];
      model?: string[];
      year?: string; // hypen separated string of year, 2000 - 20222
      searchPhrase?: string;
    },
    dryRun?: boolean
  ): Promise<PaginatedDocument<Car[]>> {
    if (!dryRun)
      await RoleService.requiresPermission(
        [
          AvailableRole.SUPERADMIN,
          AvailableRole.DRIVER,
          AvailableRole.MODERATOR,
        ],
        roles,
        AvailableResource.CAR,
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

    if (filters?.searchPhrase) {
      queries.$text = { $search: filters.searchPhrase };
    }

    // console.log(JSON.stringify({ filters }));

    return await paginate("car", queries, filters, {
      populate: ["features", "color"],
    });
  }

  async getCarById(carId: string, roles: string[]): Promise<Car> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.CAR,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _car = await car
      .findById(carId)
      .populate(["features", "color"])
      .lean<Car>()
      .exec();
    if (!_car) throw createError("Car not found", 404);
    return _car;
  }

  async getSimilarCars(carId: string, roles: string[]): Promise<Car[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.CAR,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _car = await car.findById(carId).lean<Car>().exec();

    if (!_car) throw createError("Car not found", 404);
    const similarCars = await this.getCars(
      roles,
      {
        limit: "10",
        features: _car.features as string[],
        make: [_car?.make],
        // model: [_car?.model],
        gearbox: [_car?.gearBox],
        fuelType: [_car?.fuelType],
      },
      true
    );
    return similarCars?.data;
  }

  async getCarColors(roles: string[]): Promise<CarColor[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.CAR,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await carColor.find().lean<CarColor[]>();
  }

  async getCarFeatures(roles: string[]): Promise<CarFeature[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.CAR,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await carFeature.find().lean<CarFeature[]>();
  }

  async createCar(input: CreateCarDto, roles: string[]): Promise<Car> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    if (input?.images && typeof input.images[0] === "string")
      input.images = CarService.transformImageStrings(
        input?.images as string[]
      );

    const _car = (await car.create({
      ...input,
      rapydId: AuthVerificationService.generateCode(),
    })) as Car;
    return _car;
  }

  async createCarColor(
    input: CreateCarColorDto,
    roles: string[]
  ): Promise<CarColor> {
    validateFields(input, ["color"]);

    const slug = createSlug(input?.color);
    return (await CarService.createOrUpdateCarProperty(
      "carColor",
      slug,
      input,
      roles
    )) as CarColor;
  }

  async createCarFeature(
    input: CreateCarFeatureDto,
    roles: string[]
  ): Promise<CarFeature> {
    validateFields(input, ["name"]);
    const slug = createSlug(input?.name);
    return (await CarService.createOrUpdateCarProperty(
      "carFeature",
      slug,
      input,
      roles
    )) as CarFeature;
  }

  async updateCar(
    carId: string,
    input: UpdateCarDto,
    roles: string[]
  ): Promise<Car> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    if (input.deleteImages && !isEmpty(input?.deleteImages)) {
      await CarService.removeCarImages(carId, input.deleteImages);
      delete input.deleteImages;
    }

    let _car = await car.findById(carId).lean<Car>().exec();

    if (input?.images && typeof input.images[0] === "string") {
      const newImages = CarService.treatIncomingCarImages(
        _car?.images,
        uniq(
          difference(
            input?.images as string[],
            (_car?.images ?? [])?.map((i) =>
              i?.metadata?.isCover ? `${i?.url}?cover=true` : i?.url
            )
          )
        )
      );

      //   console.log(newImages);
      input.images = !isEmpty(newImages) ? newImages : _car?.images;
    }

    if (input?.features && !isEmpty(input?.features))
      input.features = [...(_car?.features as string[]), ...input?.features];

    _car = await car
      .findByIdAndUpdate(carId, { ...input }, { new: true })
      .lean<Car>()
      .exec();
    return _car;
  }

  async updateCarColor(
    slug: string,
    input: Partial<CreateCarColorDto>,
    roles: string[]
  ): Promise<CarColor> {
    return (await CarService.createOrUpdateCarProperty(
      "carColor",
      slug,
      { ...input, slug: input?.color ? createSlug(input?.color) : slug },
      roles
    )) as CarColor;
  }

  async updateCarFeature(
    slug: string,
    input: Partial<CreateCarFeatureDto>,
    roles: string[]
  ): Promise<CarFeature> {
    return (await CarService.createOrUpdateCarProperty(
      "carFeature",
      slug,
      { ...input, slug: input?.name ? createSlug(input?.name) : slug },
      roles
    )) as CarFeature;
  }

  async deleteCar(carId: string, roles: string[]): Promise<Car> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _car = await car.findByIdAndDelete(carId).lean<Car>().exec();
    if (!_car) throw createError("Car not found", 404);
    return _car;
  }

  async deleteCarColor(carColorId: string, roles: string[]): Promise<CarColor> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _carColor = await carColor
      .findByIdAndDelete(carColorId)
      .lean<CarColor>()
      .exec();
    if (!_carColor) throw createError("Car color not found", 404);
    return _carColor;
  }

  async deleteCarFeature(
    carFeatureId: string,
    roles: string[]
  ): Promise<CarFeature> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _carFeature = await carFeature
      .findByIdAndDelete(carFeatureId)
      .lean<CarFeature>()
      .exec();
    if (!_carFeature) throw createError("Car feature not found", 404);
    return _carFeature;
  }

  // performance can be improved later.
  protected static treatIncomingCarImages(
    dbImages: CarImage[],
    newImages: string[]
  ): CarImage[] {
    // If a car image in the db is already set to cover, and there's an incoming image
    // that needs to be set to cover, remove the already existing cover image, and add it
    // back as part of the incoming images, then the transformImageString method will handle the rest.

    const newCoverImage = newImages
      .find((url) => url.includes("?cover=true"))
      ?.split("?")[0];
    if (newCoverImage && dbImages?.map((v) => v.url).includes(newCoverImage))
      dbImages = dbImages.filter((v) => v.url !== newCoverImage);

    const oldCoverImage = dbImages.find((v) => v?.metadata?.isCover === true);
    if (newCoverImage && !!oldCoverImage) {
      const oldImages = (dbImages as CarImage[]).filter(
        (v) => v?._id !== oldCoverImage?._id
      );
      const neew = CarService.transformImageStrings([
        ...newImages,
        oldCoverImage.url,
      ]);
      return [...oldImages, ...neew];
    }

    return [
      ...dbImages,
      ...CarService.transformImageStrings(newImages as string[]),
    ];
  }

  protected static async removeCarImages(
    carId: string,
    imageIds: string[],
    dryRun = true
  ) {
    const result = await car
      .findByIdAndUpdate(
        carId,
        { $pull: { images: { _id: { $in: imageIds } } } },
        { new: true }
      )
      .lean<Car>()
      .exec();
    if (!result && !dryRun)
      throw createError("Failed to remove car images", 400);
    return result;
  }

  protected static transformImageStrings(images: string[]): CarImage[] {
    // console.log(images);
    return images.filter(Boolean).map((image) => {
      const [img, query] = image.split("?");
      if (query === "cover=true") {
        return {
          url: img,
          metadata: {
            isCover: true,
          },
        } as CarImage;
      }

      return { url: image } as CarImage;
    });
  }

  protected static async createOrUpdateCarProperty<T>(
    entity: "carColor" | "carFeature",
    slug: string,
    input: T,
    roles: string[]
  ): Promise<CarColor | CarFeature> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.CAR,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const _property = await AccessService.getModel(entity)
      .findOneAndUpdate({ slug }, { ...input }, getUpdateOptions())
      .lean()
      .exec();
    if (!_property)
      throw createError(
        `Operation failed: unable to create/update ${entity}`,
        400
      );
    return _property;
  }
}

// https://images.rapyd-api.com/userA.png?cover=true
