import { dirname, join } from "path";
import { fileURLToPath } from "url";
import autoLoad from "@fastify/autoload";
import closeWithGrace from "close-with-grace";
import Fastify from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const app = Fastify();

  await app.register(autoLoad, {
    dir: join(__dirname, "plugins"),
    encapsulate: false,
  });

  await app.register(autoLoad, {
    dir: join(__dirname, "routes"),
    encapsulate: false,
    maxDepth: 1,
  });

  await app.listen({ port: 3333 });

  closeWithGrace(async ({ err }) => {
    if (err) {
      app.log.error({ err }, "Unexpected error encountered. Please check the logs for details.");
    }
    app.log.info("Shutting down gracefully.");
    await app.close();
  });
}

void main();
