import { Powered } from "../models/Powered.js";

/**
 * Get Powered By section for the frontend.
 * Returns one section: title "POWERED BY:" + partners array (name, logoUrl, link, order).
 * GET /api/powered
 * GET /api/powered?companyId=xxx
 */
export async function getByCompany(req, res, next) {
  try {
    const { companyId } = req.query;

    const filter = { isActive: true };
    if (companyId) filter.companyId = companyId;

    let section = await Powered.findOne(filter).sort({ updatedAt: -1 });

    if (!section) {
      return res.status(200).json({
        ok: true,
        data: {
          title: "POWERED BY:",
          partners: [],
          companyId: companyId || null,
        },
      });
    }

    const partners = (section.partners || []).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    res.status(200).json({
      ok: true,
      data: {
        _id: section._id,
        title: section.title,
        partners,
        companyId: section.companyId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update Powered By section (admin).
 * Body: { companyId?, title?, partners: [{ name, logoUrl?, logoText?, link?, order? }] }
 */
export async function upsert(req, res, next) {
  try {
    const { companyId, title, partners } = req.body;

    const doc = await Powered.findOneAndUpdate(
      { companyId: companyId || null },
      {
        ...(title !== undefined && { title }),
        ...(partners !== undefined && { partners }),
        ...req.body,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}
