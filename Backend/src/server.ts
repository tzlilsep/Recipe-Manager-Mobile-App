// Backend\src\server.ts

import 'dotenv/config';
import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT) || 5005;

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
