import type { FastifyPluginCallback, RouteShorthandMethod } from "fastify";

type TelegramWebhookHandler = RouteShorthandMethod & {
  Params: { secretToken: string };
  Body: {
    update_id: number;
    message: {
      date: number;
      chat: {
        last_name: string;
        id: number;
        first_name: string;
        username: string;
      };
      message_id: 1365;
      from: {
        last_name: string;
        id: number;
        first_name: string;
        username: string;
      };
      text: string;
    };
  };
};

const TELEGRAM_ROUTE_SECRET_TOKEN = process.env.TELEGRAM_ROUTE_SECRET_TOKEN;
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;

const base: FastifyPluginCallback = (app, _, done) => {
  app.post<TelegramWebhookHandler>(
    "/webhook/:secretToken",
    async (req, reply) => {
      if (req.params.secretToken !== TELEGRAM_ROUTE_SECRET_TOKEN) {
        reply.status(403);
        return reply.send();
      }

      req.log.info(req.body);

      reply.status(200);
      return reply.send();
    }
  );

  done();
};

export default base;
