"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asNonEmptyString = asNonEmptyString;
exports.asInt = asInt;
function asNonEmptyString(v, errCode) {
    const s = String(v ?? '').trim();
    if (!s)
        throw new Error(errCode);
    return s;
}
function asInt(v, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n))
        return fallback;
    return Math.floor(n);
}
