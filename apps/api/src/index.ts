import { createApp } from "./app";
import { env } from "./config/env";

const port = Number(env.PORT);
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
