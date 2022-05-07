import prisma from "@/services/prisma";

import type { FastifyPluginCallback } from "fastify";
import { makeBadge } from "badge-maker";

const base: FastifyPluginCallback = (app, _, done) => {
  app.get("/profile", async (req, reply) => {
    const format = {
      label: "Profile views",
      message: "-1-",
      color: "informational",
    };

    const svg = makeBadge(format);

    reply.type("image/svg+xml");
    return reply.send(svg);
  });

  done();
};

export default base;
