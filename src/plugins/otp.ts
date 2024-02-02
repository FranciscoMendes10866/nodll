import type { FastifyInstance } from "fastify";
import { Hotp, generateConfig, generateSecret } from "time2fa";

export async function otpPlugin(app: FastifyInstance): Promise<void> {
  app.decorate("buildOTP", () => {
    const secret = generateSecret();
    const config = generateConfig({ period: 90 });
    const code = Hotp.generatePasscode({ secret, counter: 1 }, config);
    return { secret, code };
  });

  app.decorate("validateOTP", ({ secret, code }) => {
    return Hotp.validate({
      passcode: code,
      secret,
      counter: 1,
    });
  });
}

// Data types declaration
//
type PasscodeDatum = {
  secret: string;
  code: string;
};

declare module "fastify" {
  export interface FastifyInstance {
    buildOTP: () => PasscodeDatum;
    validateOTP: (datum: PasscodeDatum) => boolean;
  }
}
