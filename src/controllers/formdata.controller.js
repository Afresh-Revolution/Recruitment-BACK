import { FormData } from "../models/FormData.js";

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
