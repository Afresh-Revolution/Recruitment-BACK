import { WhyChooseUs } from "../models/WhyChooseUs.js";

/**
 * Get WhyChooseUs section – headline, description, rating, features, trainees, gallery.
 * GET /api/whychooseus
 * GET /api/whychooseus?companyId=xxx
 */
export async function get(req, res, next) {
  try {
    const { companyId } = req.query;

    const filter = { isActive: true };
    if (companyId) filter.companyId = companyId;

    const doc = await WhyChooseUs.findOne(filter).sort({ updatedAt: -1 });

    if (!doc) {
      return res.status(200).json({
        ok: true,
        data: {
          headline: null,
          description: null,
          rating: null,
          features: [],
          previewImages: [],
          trainees: { total: 0, list: [] },
          gallery: { title: null, subtitle: null, images: [] },
          companyId: companyId || null,
        },
      });
    }

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update WhyChooseUs section (admin).
 * Body: { companyId?, sectionKey?, headline?, description?, rating?, features?, previewImages?, trainees?, gallery?, isActive? }
 */
export async function upsert(req, res, next) {
  try {
    const { companyId, sectionKey } = req.body;

    const filter =
      companyId !== undefined && companyId !== null
        ? { companyId }
        : { sectionKey: sectionKey || "why_choose_us" };

    const doc = await WhyChooseUs.findOneAndUpdate(
      filter,
      { ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/whychooseus/by-id/:id – get one WhyChooseUs document by _id.
 */
export async function getById(req, res, next) {
  try {
    const doc = await WhyChooseUs.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "WhyChooseUs section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/whychooseus/:id – update by _id.
 */
export async function update(req, res, next) {
  try {
    const doc = await WhyChooseUs.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "WhyChooseUs section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/whychooseus/:id – remove by _id.
 */
export async function remove(req, res, next) {
  try {
    const doc = await WhyChooseUs.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "WhyChooseUs section not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
