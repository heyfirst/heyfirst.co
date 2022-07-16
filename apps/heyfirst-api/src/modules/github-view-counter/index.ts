import prisma from "@/services/prisma";

import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import { makeBadge } from "badge-maker";

const routes: FastifyPluginCallback = (app, _, done) => {
  app.get("/profile", async (req, reply) => {
    if (req.headers["user-agent"]?.indexOf("github-camo") === 0) {
      await prisma.gitHubPageViews.create({
        data: {
          username: "heyfirst",
        },
      });
    }

    const count = await prisma.gitHubPageViews.count({
      where: {
        username: "heyfirst",
      },
    });

    const format = {
      label: "Profile views",
      message: count.toString(),
      color: "informational",
    };

    const svg = makeBadge(format);

    reply.type("image/svg+xml");
    reply.header(
      "Cache-Control",
      "max-age=0, no-cache, no-store, must-revalidate"
    );

    return reply.send(svg);
  });

  done();
};

export default (app: FastifyInstance) => {
  app.register(routes, {
    prefix: "/github-view-counter",
  });
};
