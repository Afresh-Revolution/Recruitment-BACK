import { Trainee } from "../models/Trainee.js";
import { TraineeSection } from "../models/TraineeSection.js";

/**
 * Get Trainee section – section title + trainee cards (name, role, avatar, rating).
 * All data from DB.
 * GET /api/trainee
 * GET /api/trainee?companyId=xxx
 */
export async function getAll(req, res, next) {
  try {
    const { companyId } = req.query;

    const sectionFilter = { isActive: true };
    const traineeFilter = { isActive: true };
    if (companyId) {
      sectionFilter.companyId = companyId;
      traineeFilter.companyId = companyId;
    }

    const section = await TraineeSection.findOne(sectionFilter)
      .sort({ updatedAt: -1 })
      .populate("traineeIds");

    let trainees = [];
    let sectionTitle = "We have over 150+ Trainee";

    if (section && section.traineeIds?.length) {
      sectionTitle = section.sectionTitle;
      trainees = section.traineeIds.map((t) => ({
        _id: t._id,
        name: t.name,
        role: t.role,
        avatar: t.avatar,
        rating: t.rating,
      }));
    } else {
      const list = await Trainee.find(traineeFilter).sort({ createdAt: 1 });
      trainees = list.map((t) => ({
        _id: t._id,
        name: t.name,
        role: t.role,
        avatar: t.avatar,
        rating: t.rating,
      }));
    }

    res.status(200).json({
      ok: true,
      data: {
        sectionTitle,
        trainees,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create trainee card.
 */
export async function create(req, res, next) {
  try {
    const doc = await Trainee.create(req.body);
    res.status(201).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}

/**
 * Update trainee card.
 */
export async function update(req, res, next) {
  try {
    const doc = await Trainee.findByIdAndUpdate(req.params.id, req.body, {
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
    const doc = await Trainee.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.status(200).json({ ok: true, data: { _id: doc._id, deleted: true } });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update TraineeSection (section title + ordered trainee IDs).
 */
export async function upsertSection(req, res, next) {
  try {
    const { companyId, sectionTitle, traineeIds } = req.body;

    const doc = await TraineeSection.findOneAndUpdate(
      { companyId: companyId || null },
      { sectionTitle, traineeIds, ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ ok: true, data: doc });
  } catch (error) {
    next(error);
  }
}
