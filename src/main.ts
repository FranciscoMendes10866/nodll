import closeWithGrace from "close-with-grace";
import Fastify from "fastify";

import { cachePlugin } from "./plugins/cache";
import { mailerPlugin } from "./plugins/mailer";
import { otpPlugin } from "./plugins/otp";
import { passwordRecoveryRoutes } from "./routes/passwordRecovery";

const app = Fastify();

app.register(cachePlugin);
app.register(mailerPlugin);
app.register(otpPlugin);
app.register(passwordRecoveryRoutes);

app.listen({ port: 3333 });

closeWithGrace(async ({ err }) => {
  if (err) {
    app.log.error({ err }, "Unexpected error encountered. Please check the logs for details.");
  }
  app.log.info("Shutting down gracefully.");
  await app.close();
});
