enum PermissionScope {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  ASSIGN = "assign",
  DELETE = "delete",
  DISABLE = "disable",
  ENABLE = "enable",
  VERIFY = "verify",
  WITHDRAW = "withdraw",
  REQUEST = "request",
  APPROVE = "approve",
  MARK = "mark", // mark notification read | unread
  ALL = "*",
}

export default PermissionScope;
