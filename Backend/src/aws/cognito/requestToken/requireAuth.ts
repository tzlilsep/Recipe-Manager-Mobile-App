import type { Request, Response, NextFunction } from "express";
import { tokenVerifier } from "./tokenVerifier";
import type { RequestWithUser } from "./requestToken.types";

function extractBearerToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// Middleware: checks that request has a real Cognito token
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req);
    if (!token) return res.status(401).json({ ok: false, error: "MISSING_TOKEN" });

    const payload = await tokenVerifier.verify(token);

    const userId = String(payload.sub || "").trim();
    if (!userId) return res.status(401).json({ ok: false, error: "MISSING_SUB" });

    const username =
      (typeof payload["cognito:username"] === "string" ? payload["cognito:username"] : undefined) ??
      (typeof payload["username"] === "string" ? payload["username"] : undefined);

    (req as RequestWithUser).user = { userId, username };
    next();
  } catch (err: unknown) {
    console.error("Auth error:", err);
    return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
  }
}
