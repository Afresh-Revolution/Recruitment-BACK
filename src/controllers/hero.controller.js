import { Hero } from "../models/Hero.js";

/**
 * Get hero section for a company.
 * All data (headline, description, CTA, features, 4 panels with images) comes from DB.
 * GET /api/hero/:companyId  or  GET /api/hero?companyId=xxx
 */
export async function getHeroByCompany(req, res, next) {
  try {
    const companyId = req.params.companyId || req.query.companyId;

    if (!companyId) {
      const first = await Hero.findOne({ isActive: true }).sort({
        updatedAt: -1,
      });
      if (!first) {
        return res.status(404).json({
          success: false,
          message: "Hero section not found",
        });
      }
      return res.status(200).json({ success: true, data: first });
    }

    const hero = await Hero.findOne({
      companyId,
      isActive: true,
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero section not found",
      });
    }

    res.status(200).json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/hero/by-id/:id – get one hero document by _id.
 */
export async function getHeroById(req, res, next) {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) {
      return res.status(404).json({ success: false, message: "Hero section not found" });
    }
    res.status(200).json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update hero section (admin).
 * Body can include: navigation, headline, description, cta, features, panels.
 */
export async function upsertHero(req, res, next) {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const hero = await Hero.findOneAndUpdate(
      { companyId },
      { ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Hero section saved successfully",
      data: hero,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/hero/:id – update hero document by _id (partial update).
 */
export async function updateHero(req, res, next) {
  try {
    const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hero) {
      return res.status(404).json({ success: false, message: "Hero section not found" });
    }
    res.status(200).json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/hero/:id – remove hero document by _id.
 */
export async function removeHero(req, res, next) {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);
    if (!hero) {
      return res.status(404).json({ success: false, message: "Hero section not found" });
    }
    res.status(200).json({ success: true, data: { _id: hero._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
