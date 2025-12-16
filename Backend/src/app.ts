// Backend\src\app.ts

import express from "express";
import cors from "cors";
import { apiRouter } from "./api/router";


export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  // 404 fallback
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: "NOT_FOUND" });
  });

  // Error handler with proper types + JSON response
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  });

  return app;
}
