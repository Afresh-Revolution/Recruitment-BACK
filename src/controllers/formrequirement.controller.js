import { FormRequirement } from "../models/FormRequirement.js";
import { Role } from "../models/Role.js";

/**
 * Get FormRequirement for a role – job form content for application.
 * Returns jobTitle, jobDescription, jobRequirements, jobQualifications,
 * jobDuration, applicationDeadline. All from DB.
 * GET /api/formrequirement?roleId=xxx
 * GET /api/formrequirement?companyId=xxx
 */
export async function getByJob(req, res, next) {
  try {
    const { roleId, companyId } = req.query;

    if (roleId) {
      const formReq = await FormRequirement.findOne({
        roleId,
        isActive: true,
      });

      if (formReq) {
        return res.status(200).json({
          ok: true,
          data: {
            jobTitle: formReq.jobTitle,
            jobDescription: formReq.jobDescription,
            jobRequirements: formReq.jobRequirements || [],
            jobQualifications: formReq.jobQualifications || [],
            jobDuration: formReq.jobDuration,
            applicationDeadline: formReq.applicationDeadline,
            roleId: formReq.roleId,
            companyId: formReq.companyId,
          },
        });
      }

      const role = await Role.findById(roleId).populate("companyId", "name logo");
      if (!role) {
        return res.status(404).json({ ok: false, message: "Role not found" });
      }

      const formattedDeadline = role.deadline
        ? new Date(role.deadline).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null;

      return res.status(200).json({
        ok: true,
        data: {
          jobTitle: role.title,
          jobDescription: role.description,
          jobRequirements: role.requirements || [],
          jobQualifications: role.qualifications || [],
          jobDuration: role.type,
          applicationDeadline: formattedDeadline,
          roleId: role._id,
          companyId: role.companyId,
        },
      });
    }

    const list = await FormRequirement.find({
      ...(companyId && { companyId }),
      isActive: true,
    })
      .populate("roleId", "title type")
      .sort({ updatedAt: -1 });

    res.status(200).json({ ok: true, data: list });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update FormRequirement for a role (admin).
 */
export async function upsert(req, res, next) {
  try {
    const { companyId, roleId, jobTitle, jobDescription, jobRequirements, jobQualifications, jobDuration, applicationDeadline, deadlineDate } = req.body;

    if (!companyId || !roleId) {
      return res.status(400).json({
        ok: false,
        message: "companyId and roleId are required",
      });
    }

    const doc = await FormRequirement.findOneAndUpdate(
      { companyId, roleId },
      {
        jobTitle,
        jobDescription,
        jobRequirements: jobRequirements || [],
        jobQualifications: jobQualifications || [],
        jobDuration,
        applicationDeadline,
        deadlineDate: deadlineDate || null,
        ...req.body,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/formrequirement/:id – get one FormRequirement by _id.
 */
export async function getById(req, res, next) {
  try {
    const doc = await FormRequirement.findById(req.params.id)
      .populate("roleId", "title type")
      .populate("companyId", "name");
    if (!doc) return res.status(404).json({ ok: false, message: "Form requirement not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/formrequirement/:id – update by _id.
 */
export async function update(req, res, next) {
  try {
    const doc = await FormRequirement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "Form requirement not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/formrequirement/:id – remove by _id.
 */
export async function remove(req, res, next) {
  try {
    const doc = await FormRequirement.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Form requirement not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
