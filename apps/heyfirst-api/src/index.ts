import env from "dotenv";
env.config();

import fastify from "fastify";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import blogModule from "@/modules/blog";
import githubViewCounterModule from "@/modules/github-view-counter";
import mondayModule from "@/modules/monday";
import prisma from "@/services/prisma";

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
  trustProxy: true,
});

const main = async () => {
  await prisma.$connect();

  app.register(helmet);
  app.register(cookie);
  app.register(cors, {
    origin: [/localhost:3000$/, /heyfirst.co$/, /(.*)heyfirst.vercel.app$/],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    preflight: true,
  });

  const modules = [blogModule, githubViewCounterModule, mondayModule];
  modules.map((module) => module(app));

  app.listen(
    { port: Number(process.env.PORT) || 8080, host: "0.0.0.0" },
    (error, address) => {
      if (error) return console.error(error);

      console.log(`Running at ${address}`);
    }
  );
};

main();
