import { Gallery } from "../models/Gallery.js";

/**
 * Get Gallery section – category tag, title, subtitle, images, copyright.
 * All data from DB.
 * GET /api/gallery
 * GET /api/gallery?companyId=xxx
 */
export async function getByCompany(req, res, next) {
  try {
    const { companyId } = req.query;
    const filter = { isActive: true };
    if (companyId) filter.companyId = companyId;

    const doc = await Gallery.findOne(filter).sort({ updatedAt: -1 });

    if (!doc) {
      return res.status(200).json({
        ok: true,
        data: {
          categoryTag: "Life at Cage",
          title: "Our Gallery",
          subtitle: "A glimpse into our community and culture.",
          images: [],
          copyright: "© 2026 Cage All rights reserved.",
        },
      });
    }

    const images = (doc.images || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) =>
        typeof img === "string"
          ? { url: img, alt: null, order: 0 }
          : { url: img.url, alt: img.alt, order: img.order ?? 0 }
      );

    res.status(200).json({
      ok: true,
      data: {
        _id: doc._id,
        categoryTag: doc.categoryTag,
        title: doc.title,
        subtitle: doc.subtitle,
        images,
        copyright: doc.copyright,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update Gallery section (admin).
 */
export async function upsert(req, res, next) {
  try {
    const { companyId } = req.body;

    const doc = await Gallery.findOneAndUpdate(
      { companyId: companyId || null },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/gallery/by-id/:id – get one Gallery document by _id.
 */
export async function getById(req, res, next) {
  try {
    const doc = await Gallery.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Gallery section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/gallery/:id – update by _id.
 */
export async function update(req, res, next) {
  try {
    const doc = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ ok: false, message: "Gallery section not found" });
    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/gallery/:id – remove by _id.
 */
export async function remove(req, res, next) {
  try {
    const doc = await Gallery.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Gallery section not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
