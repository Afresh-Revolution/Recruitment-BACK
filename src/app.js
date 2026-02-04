import express from "express";
import cors from "cors";
import morgan from "morgan";

import { companyRouter } from "./routes/company.routes.js";
import { heroRouter } from "./routes/hero.routes.js";
import { poweredRouter } from "./routes/powered.routes.js";
import { opportunitiesRouter } from "./routes/opportunities.routes.js";
import { whychooseusRouter } from "./routes/whychooseus.routes.js";
import { traineeRouter } from "./routes/trainee.routes.js";
import { galleryRouter } from "./routes/gallery.routes.js";
import { destinationRouter } from "./routes/destination.routes.js";
import { roleRouter } from "./routes/role.routes.js";
import { formdataRouter } from "./routes/formdata.routes.js";
import { formrequirementRouter } from "./routes/formrequirement.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    cors({
      origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
      credentials: true,
    })
  );

  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/", (_req, res) =>
    res.json({ ok: true, service: "the-cage-backend" })
  );
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/company", companyRouter);
  app.use("/api/hero", heroRouter);
  app.use("/api/powered", poweredRouter);
  app.use("/api/opportunities", opportunitiesRouter);
  app.use("/api/whychooseus", whychooseusRouter);
  app.use("/api/trainee", traineeRouter);
  app.use("/api/gallery", galleryRouter);
  app.use("/api/destination", destinationRouter);
  app.use("/api/role", roleRouter);
  app.use("/api/formdata", formdataRouter);
  app.use("/api/formrequirement", formrequirementRouter);
  app.use("/api/admin", adminRouter);

  app.use((err, _req, res, _next) => {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
      ok: false,
      error: { message: err.message || "Internal Server Error" },
    });
  });

  return app;
}
