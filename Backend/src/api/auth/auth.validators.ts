import type { Request } from "express";
import type { LoginRequestDto } from "./auth.types";

export function parseLoginRequest(
  req: Request
):
  | { ok: true; data: { username: string; password: string } }
  | { ok: false; error: string } {
  const body = req.body as Partial<LoginRequestDto> | undefined;

  if (!body) return { ok: false, error: "Invalid request body." };

  if (typeof body.username !== "string" || typeof body.password !== "string") {
    return { ok: false, error: "Username and password are required." };
  }

  return { ok: true, data: { username: body.username, password: body.password } };
}
