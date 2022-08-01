export enum VerifyMeRoute {
  NIN = "nin",
  BVN = "bvn",
  DRIVERS_LICENSE = "drivers_license",
  ADDRESS = "",
}

interface GenericVerifyDto {
  firstname: string;
  lastname: string;
  dob: string; //"04-04-1944"
}

export interface VerifyNinDto extends GenericVerifyDto {
  nin: string;
}

export interface VerifyBvnDto extends GenericVerifyDto {
  bvn: string;
}

export interface VerifyDriversLicenseDto extends GenericVerifyDto {
  licenseNo: string;
}

export interface VerifyAddressDto {
  street: string;
  lga: string;
  state: string;
  landmark: string;
  applicant: {
    idType: string;
    idNumber: string;
    firstname: string;
    lastname: string;
    phone: string;
    dob: string;
  };
}
