import type { FastifyPluginCallback, RouteShorthandMethod } from "fastify";

type TelegramRequestBody = {
  update_id: number;
  message_id: number;
  message: {
    date: number;
    chat: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
      type: "private";
    };
    from: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      language_code: string;
      is_bot: boolean;
    };
    text: string;
  };
};

type TelegramWebhookHandler = RouteShorthandMethod & {
  Params: { secretToken: string };
  Body: TelegramRequestBody;
};

const TELEGRAM_ROUTE_SECRET_TOKEN = process.env.TELEGRAM_ROUTE_SECRET_TOKEN;
const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const base: FastifyPluginCallback = (app, _, done) => {
  app.post<TelegramWebhookHandler>(
    "/webhook/:secretToken",
    async ({ body, params, log }, reply) => {
      const isChatID = body.message.chat.id.toString() === TELEGRAM_CHAT_ID;
      const isSecretRoute = params.secretToken === TELEGRAM_ROUTE_SECRET_TOKEN;

      if (!isChatID || !isSecretRoute) {
        reply.status(403);
        return reply.send();
      }

      // TODO(telegram): reply back to correct chat id with Yah!
      log.info({ message: "Yah!" });

      reply.status(200);
      return reply.send();
    }
  );

  done();
};

export default base;
