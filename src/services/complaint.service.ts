import RoleService from "./role.service";
import { CreateComplaintDto, CreateComplaintFeedbackDto } from "../interfaces/dtos";
import { PermissionScope } from "../valueObjects";
import { AvailableResource, AvailableRole, complaint, Complaint, ComplaintFeedback, complaintFeedback } from "../entities";
import { createError, paginate } from "../utils";
import { IPaginationFilter, PaginatedDocument } from "interfaces/ros";
import AccessService from "./access.service";

export default class ComplaintService {
  async getComplaintById(complaintId: string, roles: string[]): Promise<Complaint> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _comp = await complaint.findById(complaintId).populate("creator").lean<Complaint>().exec();
    if (!_comp) throw createError("Complaint not found", 404);
    return _comp;
  }

  async getComplaints(
    roles: string[],
    filters: IPaginationFilter & { searchPhrase?: string }
  ): Promise<PaginatedDocument<Complaint[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    let queries: any = {};
    if (filters?.searchPhrase) {
      queries = { $text: { $search: filters.searchPhrase } };
    }

    return await paginate("complaint", queries, filters);
  }

  async getComplaintFeedbacks(
    complaintId: string,
    roles: string[],
    filters: IPaginationFilter
  ): Promise<PaginatedDocument<ComplaintFeedback[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT_FEEDBACK,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    return await paginate("complaintFeedback", { complaint: complaintId }, filters);
  }

  async createComplaint(accountId: string, input: CreateComplaintDto, roles: string[]): Promise<Complaint> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    return await complaint.create({ ...input, creator: accountId });
  }

  async createComplaintFeedback(
    accountId: string,
    complaintId: string,
    input: CreateComplaintFeedbackDto,
    roles: string[]
  ): Promise<ComplaintFeedback> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT_FEEDBACK,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    return await complaintFeedback.create({
      ...input,
      creator: accountId,
      complaint: complaintId,
    });
  }

  async updateComplaint(
    accountId: string,
    complaintId: string,
    input: Partial<CreateComplaintDto>,
    roles: string[]
  ): Promise<Complaint> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const _complaint = await complaint
      .findOneAndUpdate({ _id: complaintId, creator: accountId }, { ...input }, { new: true })
      .lean<Complaint>()
      .exec();
    if (!_complaint) throw createError("Complaint not found", 404);
    return _complaint;
  }

  async updateComplaintFeedback(
    feedbackId: string,
    input: Partial<CreateComplaintFeedbackDto>,
    roles: string[]
  ): Promise<ComplaintFeedback> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT_FEEDBACK,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const _complaint = await complaintFeedback
      .findByIdAndUpdate(feedbackId, { ...input }, { new: true })
      .lean<ComplaintFeedback>()
      .exec();
    if (!_complaint) throw createError("Complaint feedback not found", 404);
    return _complaint;
  }

  async deleteComplaint(accountId: string, complaintId: string, roles: string[]): Promise<Complaint> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    if (!(await RoleService.hasOneOrMore([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles)))
      await AccessService.documentBelongsToAccount(accountId, complaintId, "complaint", "creator");

    const _complaint = await complaint.findOneAndDelete({ _id: complaintId }).lean<Complaint>().exec();
    if (!_complaint) throw createError("Complaint not found", 404);
    return _complaint;
  }

  async deleteComplaintFeedback(feedbackId: string, roles: string[]): Promise<ComplaintFeedback> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.COMPLAINT_FEEDBACK,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _feedback = await complaintFeedback.findByIdAndDelete(feedbackId).lean<ComplaintFeedback>().exec();
    if (!_feedback) throw createError("Complaint not found", 404);
    return _feedback;
  }
}
