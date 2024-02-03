import type { FastifyInstance } from "fastify";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  ignoreTLS: true,
});

export default async function mailerPlugin(app: FastifyInstance): Promise<void> {
  app.decorate("sendRecoveryEmail", async (to, passcode) => {
    return new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: "your_email@provider.yolo",
          to,
          subject: "Password Recovery",
          text: `Your OTP for password recovery is: ${passcode}`,
        },
        (err) => {
          if (err) {
            app.log.error({ err }, "Error sending recovery email");
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  });
}

// Data types declaration
//
declare module "fastify" {
  export interface FastifyInstance {
    sendRecoveryEmail: (to: string, passcode: string) => Promise<void>;
  }
}
