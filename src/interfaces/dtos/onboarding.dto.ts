import {
  ApplicationStatus,
  Biodata,
  DocumentUpload,
  Guarantor,
  HirePurchaseContract,
} from "../../entities";

export interface BiodataDto extends Biodata {}

export interface DocumentUploadDto extends DocumentUpload {}

export interface HirePurchaseContractDto extends HirePurchaseContract {}

export interface UpdateApplicationStatusDto extends ApplicationStatus {}

export interface ApplicationStatusDto extends ApplicationStatus {}
export interface AddGuarantorsDto {
  guarantors: Guarantor[];
}
