import env from "dotenv";
env.config();

import fastify from "fastify";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import blog from "@/modules/blog";
import githubViewCounter from "@/modules/github-view-counter";
import prisma from "@/services/prisma";

const app = fastify({
  logger: true,
});

const main = async () => {
  await prisma.$connect();

  app
    .register(helmet)
    .register(cookie)
    .register(cors, {
      origin: [/localhost:3000$/, /heyfirst.co$/, /(.*)heyfirst.vercel.app$/],
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
      preflight: true,
    })
    .register(blog, {
      prefix: "/blog",
    })
    .register(githubViewCounter, {
      prefix: "/github-view-counter",
    })
    .listen(process.env.PORT ?? 8080, "0.0.0.0", (error, address) => {
      if (error) return console.error(error);

      console.log(`Running at ${address}`);
    });
};

main();
