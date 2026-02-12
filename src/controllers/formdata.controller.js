import { FormData } from "../models/FormData.js";

const TOP_LEVEL_KEYS = ["companyId", "roleId", "applicantId"];

/**
 * POST /api/formdata/apply – single endpoint: multipart form with optional "resume" file
 * and application fields. Stores CV with multer and application in MongoDB.
 * Body fields: companyId, roleId, applicantId (optional), plus any data fields (fullName, email, phone, etc.).
 */
export async function createWithResume(req, res, next) {
  try {
    const body = req.body || {};
    const companyId = body.companyId;
    const roleId = body.roleId;
    const applicantId = body.applicantId || null;

    if (!companyId || !roleId) {
      return res.status(400).json({
        ok: false,
        message: "companyId and roleId are required.",
      });
    }

    const data = {};
    for (const [key, value] of Object.entries(body)) {
      if (TOP_LEVEL_KEYS.includes(key)) continue;
      if (value !== undefined && value !== "") data[key] = value;
    }

    if (req.file) {
      const resumeUrl = `/uploads/${req.file.filename}`;
      data.resumeUrl = resumeUrl;
      data.attachmentUrl = resumeUrl;
    }

    const doc = await FormData.create({
      companyId,
      roleId,
      applicantId,
      data,
    });
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function getByCompany(req, res, next) {
  try {
    const list = await FormData.find({
      ...(req.query.companyId && { companyId: req.query.companyId }),
    });
    res.json({ ok: true, data: list });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await FormData.create(req.body);
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/formdata/:id – partial update of application (e.g. data field).
 */
export async function update(req, res, next) {
  try {
    const doc = await FormData.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await FormData.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
