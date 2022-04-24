import { Router } from "express";
import { RoleController } from "../controllers";

const router = Router();
const controller = new RoleController();

router.get("/", controller.getRoles);
router.post("/", controller.createRole);
router.put("/:roleId/assign", controller.assignRole);
router.put("/:roleId/unassign", controller.unassignRole);

router.get("/:roleId/scopes", controller.getResources);
router.post("/:roleId/scopes", controller.addPermissionScopes);
router.delete(
  "/:roleId/scopes/:resourceId/:scope",
  controller.revokePermissionScope
);

router.get("/:id/permissions", controller.getPermissions);
router.post("/:id/permissions", controller.addPermission);
router.delete("/:id/permissions/:resId", controller.revokePermission);

router.post("/resources", controller.createResource);
router.get("/resources", controller.getResources);
router.delete("/resources/:id", controller.deleteResource);

export default router;
