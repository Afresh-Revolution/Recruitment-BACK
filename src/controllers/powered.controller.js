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

/**
 * GET /api/powered/by-id/:id – get one Powered document by _id.
 */
export async function getById(req, res, next) {
  try {
    const doc = await Powered.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Powered section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/powered/:id – update Powered document by _id.
 */
export async function update(req, res, next) {
  try {
    const doc = await Powered.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "Powered section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/powered/:id – remove Powered document by _id.
 */
export async function remove(req, res, next) {
  try {
    const doc = await Powered.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Powered section not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
