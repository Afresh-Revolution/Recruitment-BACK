import { Opportunities } from "../models/Opportunities.js";

/**
 * Get Opportunities section – section headers + job cards (roles with company).
 * All data from DB: trendingLabel, sectionTitle, roles (title, department, type,
 * location, deadline, company name & logo), viewMoreButton.
 * GET /api/opportunities
 * GET /api/opportunities?companyId=xxx
 */
export async function getByCompany(req, res, next) {
  try {
    const { companyId } = req.query;

    const filter = { isActive: true };
    if (companyId) filter.companyId = companyId;

    const section = await Opportunities.findOne(filter)
      .sort({ updatedAt: -1 })
      .populate({
        path: "roleIds",
        populate: { path: "companyId", select: "name logo" },
      });

    if (!section) {
      return res.status(200).json({
        ok: true,
        data: {
          trendingLabel: "Trending Opportunities",
          sectionTitle: "Available Roles",
          roles: [],
          viewMoreButton: { text: "View More Roles →", link: "/roles" },
        },
      });
    }

    const roles = (section.roleIds || []).map((r) => ({
      _id: r._id,
      title: r.title,
      department: r.department,
      type: r.type,
      location: r.location,
      deadline: r.deadline,
      company: r.companyId
        ? {
            name: r.companyId.name,
            logo: r.companyId.logo,
          }
        : null,
    }));

    res.status(200).json({
      ok: true,
      data: {
        _id: section._id,
        trendingLabel: section.trendingLabel,
        sectionTitle: section.sectionTitle,
        roles,
        viewMoreButton: section.viewMoreButton || {
          text: "View More Roles →",
          link: "/roles",
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update Opportunities section (admin).
 * Body: { companyId?, trendingLabel?, sectionTitle?, roleIds?, viewMoreButton? }
 */
export async function upsert(req, res, next) {
  try {
    const { companyId } = req.body;

    const doc = await Opportunities.findOneAndUpdate(
      { companyId: companyId || null },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}
