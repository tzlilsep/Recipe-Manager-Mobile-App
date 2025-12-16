"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtClaim = getJwtClaim;
function base64UrlDecode(input) {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return Buffer.from(padded, "base64").toString("utf8");
}
// Extract claim from JWT payload (no signature verification) — כמו ב-.NET
function getJwtClaim(jwt, claim) {
    const parts = jwt.split(".");
    if (parts.length < 2)
        return "";
    try {
        const json = base64UrlDecode(parts[1]);
        const payload = JSON.parse(json);
        const val = payload[claim];
        return typeof val === "string" ? val : "";
    }
    catch {
        return "";
    }
}
