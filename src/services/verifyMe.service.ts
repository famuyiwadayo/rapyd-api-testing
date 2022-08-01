import consola from "consola";
import configs from "../config";
import { makeRequest, validateFields } from "../utils";
import { VerifyAddressDto, VerifyBvnDto, VerifyDriversLicenseDto, VerifyMeRoute, VerifyNinDto } from "../interfaces/dtos";
import { VerifyBvnRo, VerifyDriversLicenseRo, VerifyNiNRo } from "interfaces/ros";

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
    validateFields(input, ["applicant", "landmark", "lga", "state", "street"]);
    const res = await makeRequest<VerifyAddressDto, any>({
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

  static async checkVerification(res: any) {
    console.log("Verification Check", res);
  }
}
