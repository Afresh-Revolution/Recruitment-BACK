import { Role } from "../models/Role.js";
import { Company } from "../models/Company.js";
import { RoleSection } from "../models/RoleSection.js";

/**
 * Get Roles section – company name, tagline, filter categories, and role cards.
 * All data from DB. GET /api/role?companyId=xxx
 */
export async function getByCompany(req, res, next) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      const list = await Role.find({ isActive: true })
        .populate("companyId", "name logo")
        .sort({ createdAt: -1 });
      return res.status(200).json({ ok: true, data: { roles: list } });
    }

    const [company, section, roles] = await Promise.all([
      Company.findById(companyId).select("name logo"),
      RoleSection.findOne({ companyId, isActive: true }),
      Role.find({ companyId, isActive: true }).sort({ createdAt: -1 }),
    ]);

    const filterCategories =
      section?.filterCategories?.length > 0
        ? section.filterCategories
        : ["All", ...new Set(roles.map((r) => r.department).filter(Boolean))];

    const sectionTagline =
      section?.sectionTagline ?? "text challenge and apply today.";

    const rolesData = roles.map((r) => ({
      _id: r._id,
      title: r.title,
      department: r.department,
      type: r.type,
      location: r.location,
      deadline: r.deadline,
      applyByLabel: r.deadline
        ? `Apply by ${new Date(r.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        : null,
      applyLink: `/apply/${r._id}`,
    }));

    res.status(200).json({
      ok: true,
      data: {
        companyName: company?.name ?? null,
        companyLogo: company?.logo ?? null,
        sectionTagline,
        filterCategories,
        roles: rolesData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await Role.create(req.body);
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Role.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update RoleSection (tagline, filter categories) for a company.
 */
export async function upsertSection(req, res, next) {
  try {
    const { companyId, sectionTagline, filterCategories } = req.body;

    if (!companyId) {
      return res.status(400).json({
        ok: false,
        message: "companyId is required",
      });
    }

    const doc = await RoleSection.findOneAndUpdate(
      { companyId },
      { sectionTagline, filterCategories, ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}
