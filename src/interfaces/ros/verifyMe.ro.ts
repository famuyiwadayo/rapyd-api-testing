interface GenericVerifyRo {
  firstname: string;
  lastname: string;
  middlename: string;
  gender: "m" | "f" | "M" | "F" | "Male" | "Female" | "male" | "female";
  birthdate: string;
  photo: string;
  phone: string;
  fieldMatches: {
    lastname: boolean;
    firstname: boolean;
    middlename: boolean;
  };
}

export interface VerifyNiNRo extends GenericVerifyRo {
  nin: string;
  trackingId: string;
  nationality: string;
  residence: {
    address: string;
    lga: string;
  };
}

export interface VerifyBvnRo extends GenericVerifyRo {
  bvn: string;
  nationality: string;
}

export interface VerifyDriversLicenseRo extends GenericVerifyRo {
  licenseNo: string;
  issuedDate: string;
  expiryDate: string;
  stateOfIssue: string;
}

export interface VerifyAddressRo {
  id: number;
  applicant: {
    firstname: string;
    lastname: string;
    phone: string;
    idType: string;
    idNumber: string;
    middlename: string;
    photo: string;
    gender: string;
    birthdate: string;
  };
  createdAt: string;
  lattitude: string;
  longitude: string;
  photos: [];
  neighbor: {};
  status: {
    status: "IN PROGRESS" | "COMPLETED" | "VERIFIED";
    subStatus: "IN PROGRESS" | "COMPLETED" | "VERIFIED";
    state: "IN_PROGRESS" | "COMPLETED" | "VERIFIED";
  };
  city: string;
  street: string;
  lga: string;
  state: string;
  country: string;
  reference: string;
}
