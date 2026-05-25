import http from "http";

import { setupSocket } from "./socket";
import { setupJobs } from "./jobs";
import { connectMongoDB } from "src/module/shared/database/mongodb";
import createApp from "./app";

const PORT = 4000;

const startServer = async () => {
  await connectMongoDB();

  const app = createApp();
  const server = http.createServer(app);

  setupSocket(server);
  setupJobs(app);

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();