import { PaymentItem } from "../../entities";

export interface AddPaymentItemDto
  extends Omit<PaymentItem, "createdAt" | "updatedAt" | "_id"> {}
