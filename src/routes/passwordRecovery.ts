import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function passwordRecoveryRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.post("/request-recovery", {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
        },
        required: ["username"],
      },
    },
    handler: async (
      request: FastifyRequest<{
        Body: {
          username: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const { username } = request.body;

      // FYK: Now we would get the user's email

      const otp = app.buildOTP();

      const success = app.setCacheItem<string>({
        key: btoa(username),
        datum: otp.secret,
      });
      if (!success) {
        throw new Error("An error occurred");
      }

      await app.sendRecoveryEmail("user_email@provider.yolo", otp.code);

      return reply
        .code(200)
        .send({ result: "Password recovery code sent successfully" });
    },
  });

  app.post("/reset-password", {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
          code: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["username", "code", "newPassword"],
      },
    },
    handler: async (
      request: FastifyRequest<{
        Body: {
          username: string;
          code: string;
          newPassword: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const { username, code } = request.body;

      const value = app.getCacheItem<string>(btoa(username));
      if (!value) {
        throw new Error("OTP secret not found");
      }

      const valid = app.validateOTP({ code, secret: value.datum });
      if (!valid) {
        throw new Error("Invalid OTP");
      }

      app.removeCacheItem(username);

      // FYK: Now the newPassword would be saved to the database

      return reply.code(200).send({ result: "Password reset successfully" });
    },
  });
}
