function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

// Extract claim from JWT payload (no signature verification) — כמו ב-.NET
export function getJwtClaim(jwt: string, claim: string): string {
  const parts = jwt.split(".");
  if (parts.length < 2) return "";

  try {
    const json = base64UrlDecode(parts[1]);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const val = payload[claim];
    return typeof val === "string" ? val : "";
  } catch {
    return "";
  }
}
