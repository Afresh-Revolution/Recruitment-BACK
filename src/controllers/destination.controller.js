import { Destination } from "../models/Destination.js";
import { Role } from "../models/Role.js";

/**
 * Get Destination section – "Choose Your Destination" + company cards.
 * Each card: logo, name, description, backgroundImage, partnerTag, openRolesCount, selectButton.
 * GET /api/destination
 * GET /api/destination?companyId=xxx
 */
export async function getByCompany(req, res, next) {
  try {
    const { companyId } = req.query;

    const filter = { isActive: true };
    if (companyId) filter.companyId = companyId;

    const section = await Destination.findOne(filter)
      .sort({ updatedAt: -1 })
      .populate("companyIds");

    if (!section) {
      return res.status(200).json({
        ok: true,
        data: {
          sectionTitle: "Choose Your Destination",
          sectionDescription:
            "Select a partner company to view their open positions. Each offers unique challenges and world-class environments.",
          selectButtonText: "Select →",
          companies: [],
        },
      });
    }

    const companyIds = section.companyIds || [];
    const companies = await Promise.all(
      companyIds.map(async (c) => {
        if (!c || !c._id) return null;
        const openRolesCount = await Role.countDocuments({
          companyId: c._id,
          isActive: true,
        });
        return {
          _id: c._id,
          name: c.name,
          logo: c.logo,
          description: c.description,
          backgroundImage: c.backgroundImage,
          partnerTag: c.partnerTag || "Partner",
          openRolesCount,
          selectLink: `/companies/${c._id}`,
        };
      })
    );

    res.status(200).json({
      ok: true,
      data: {
        _id: section._id,
        sectionTitle: section.sectionTitle,
        sectionDescription: section.sectionDescription,
        selectButtonText: section.selectButtonText || "Select →",
        companies: companies.filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await Destination.create(req.body);
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Destination.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ ok: false, message: "Not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}
