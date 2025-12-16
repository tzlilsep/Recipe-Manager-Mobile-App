"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.withTx = withTx;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString)
    throw new Error('DATABASE_URL is missing');
exports.db = new pg_1.Pool({ connectionString });
// Small helper for transactions
async function withTx(fn) {
    const client = await exports.db.connect();
    try {
        await client.query('BEGIN');
        const res = await fn(client);
        await client.query('COMMIT');
        return res;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
