enum PaystackRoute {
  CHARGE = "charge",
  SUBMIT_PIN = "charge/submit_pin",
  SUBMIT_OTP = "SUBMIT_OTP",
  SUBMIT_PHONE = "charge/submit_phone",
  SUBMIT_BIRTHDAY = "charge/submit_birthday",
  CHARGE_AUTHORIZATION = "transaction/charge_authorization",
  RESOLVE_ACCOUNT_NUMBER = "bank/resolve",
  INITIALIZE_TRANSACTION = "transaction/initialize",
  BANKS = "bank",
  TRANSFER_RECEIPT = "transferrecipient",
  TRANSFER = "transfer",
  VERIFY_TRANSFER = "transfer/verify",
  SUB_ACCOUNTS = "subaccount",
}

export default PaystackRoute;
