"use strict";
// Backend\src\server.ts
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const app = (0, app_1.createApp)();
const port = Number(process.env.PORT) || 5005;
app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${port}`);
});
