import { Company } from "../models/Company.js";

export async function getAll(req, res, next) {
  try {
    const companies = await Company.find({ active: true });
    res.json({ ok: true, data: companies });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ ok: false, message: "Company not found" });
    res.json({ ok: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ ok: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ ok: false, message: "Company not found" });
    res.json({ ok: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ ok: false, message: "Company not found" });
    res.status(200).json({ ok: true, data: { _id: company._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
