
import buildApp from "./app";
import config from "./config";

const start = async () => {
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log("Server started on port", config.port);
};

start();
