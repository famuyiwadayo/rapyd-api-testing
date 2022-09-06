import consola from "consola";
import configs from "../config";
import { createError, getUpdateOptions, makeRequest, validateFields } from "../utils";
import { BiodataDto, VerifyAddressDto, VerifyBvnDto, VerifyDriversLicenseDto, VerifyMeRoute, VerifyNinDto } from "../interfaces/dtos";
import { VerifyAddressRo, VerifyBvnRo, VerifyDriversLicenseRo, VerifyNiNRo } from "../interfaces/ros";
import { Account, account, verificationStatus, VerificationStatus } from "../entities";
import { format, isEqual as isDateEqual } from "date-fns";
import { isEqual } from "lodash";
import { EVerificationStatus } from "../entities/verificationStatus";

const toGender = (value: string) => {
  if (!value.toLowerCase().split("").includes("f")) return "male";
  else return "female";
};

export default class VerifyMeService {
  static async verifyNiN(input: VerifyNinDto) {
    validateFields(input, ["dob", "firstname", "lastname", "nin"]);
    const { nin, ...data } = input;
    const res = await makeRequest<Omit<VerifyNinDto, "nin">, VerifyNiNRo>({
      data,
      method: "POST",
      url: VerifyMeService.createUrl(VerifyMeRoute.NIN, nin),
      headers: VerifyMeService.getHeaders(),
    });

    return res?.data;
  }

  static async verifyBvn(input: VerifyBvnDto) {
    validateFields(input, ["dob", "firstname", "lastname", "bvn"]);
    const { bvn, ...data } = input;
    const res = await makeRequest<Omit<VerifyBvnDto, "bvn">, VerifyBvnRo>({
      data,
      method: "POST",
      url: VerifyMeService.createUrl(VerifyMeRoute.BVN, bvn),
      headers: VerifyMeService.getHeaders(),
    });

    return res?.data;
  }

  static async verifyDriversLicense(input: VerifyDriversLicenseDto) {
    validateFields(input, ["dob", "firstname", "lastname", "licenseNo"]);
    const { licenseNo, ...data } = input;
    const res = await makeRequest<Omit<VerifyDriversLicenseDto, "licenseNo">, VerifyDriversLicenseRo>({
      data,
      method: "POST",
      url: VerifyMeService.createUrl(VerifyMeRoute.DRIVERS_LICENSE, licenseNo),
      headers: VerifyMeService.getHeaders(),
    });

    return res?.data;
  }

  static async verifyAddress(input: VerifyAddressDto) {
    validateFields(input, ["applicant", "lga", "state", "street"]);
    const res = await makeRequest<VerifyAddressDto, VerifyAddressRo["data"]>({
      data: input,
      method: "POST",
      url: `https://vapi.verifyme.ng/v1/verifications/addresses/`,
      headers: VerifyMeService.getHeaders(),
    });

    return res?.data;
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${configs.VERIFY_ME_KEY}`,
      "Content-Type": "application/json",
    };
  }

  static createUrl(route: VerifyMeRoute, path?: string): string {
    if (path && !path.startsWith("/")) path = `/${path}`;
    let url = `https://vapi.verifyme.ng/v1/verifications/identities/${route}`;
    if (path) url = url.concat(path);
    consola.info("Calling verifyMe: ", url);
    return url;
  }

  static async checkVerification(res: VerifyAddressRo) {
    console.log("Verification Check", res);
    switch (res.type) {
      case "address":
        // something here
        break;

      default:
        break;
    }
  }

  static async checkAndValidateNiN(accountId: string, biodata: BiodataDto): Promise<VerificationStatus> {
    const { dob, sex } = biodata.personalInfo;
    const { nin } = biodata.securityQuestions;

    const gender = toGender(sex);

    const acc = await account.findById(accountId).select(["firstName", "lastName"]).lean<Account>().exec();
    if (!acc) throw createError("Account not found", 404);
    const ninInfo = await VerifyMeService.verifyNiN({
      firstname: acc?.firstName,
      lastname: acc?.lastName,
      dob: format(dob, "dd-MM-yyyy"),
      nin,
    });

    const match: Omit<VerificationStatus["nin"], "status" | "_id"> = {
      ninValue: nin,
      firstname: isEqual(acc?.firstName, ninInfo.firstname),
      lastname: isEqual(acc?.lastName, ninInfo.lastname),
      nin: isEqual(nin, ninInfo.nin),
      dob: isDateEqual(dob, new Date(ninInfo.birthdate)),
      gender: isEqual(gender, toGender(ninInfo.gender as string)),
    };

    const isValid = match.firstname && match.lastname && match.dob && match.gender && match.nin;
    return await verificationStatus
      .findOneAndUpdate(
        { account: accountId },
        { nin: match, status: isValid ? EVerificationStatus.VERIFIED : EVerificationStatus.REJECTED },
        getUpdateOptions()
      )
      .lean<VerificationStatus>()
      .exec();
  }

  static async checkAndValidateDriversLicense(accountId: string, biodata: BiodataDto): Promise<VerificationStatus> {
    const { dob, sex } = biodata.personalInfo;
    const { licenseNo } = biodata.securityQuestions;

    const gender = toGender(sex);

    const acc = await account.findById(accountId).select(["firstName", "lastName"]).lean<Account>().exec();
    if (!acc) throw createError("Account not found", 404);
    const licenseInfo = await VerifyMeService.verifyDriversLicense({
      firstname: acc?.firstName,
      lastname: acc?.lastName,
      dob: format(dob, "dd-MM-yyyy"),
      licenseNo,
    });

    const match: Omit<VerificationStatus["driversLicense"], "status" | "_id"> = {
      licenseNoValue: licenseNo,
      firstname: isEqual(acc?.firstName, licenseInfo.firstname),
      lastname: isEqual(acc?.lastName, licenseInfo.lastname),
      licenseNo: isEqual(licenseNo, licenseInfo.licenseNo),
      dob: isDateEqual(dob, new Date(licenseInfo.birthdate)),
      gender: isEqual(gender, toGender(licenseInfo.gender as string)),
    };

    const isValid = match.firstname && match.lastname && match.dob && match.gender && match.licenseNo;
    return await verificationStatus
      .findOneAndUpdate(
        { account: accountId },
        { driversLicense: match, status: isValid ? EVerificationStatus.VERIFIED : EVerificationStatus.REJECTED },
        getUpdateOptions()
      )
      .lean<VerificationStatus>()
      .exec();
  }
}
