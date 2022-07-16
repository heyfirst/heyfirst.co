import type { FastifyPluginCallback, RouteShorthandMethod } from "fastify";
import axios from "axios";

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

      log.info(body, "get message from telegram");
      axios.post(
        `https://api.telegram.org/bot${TELEGRAM_SECRET_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: body.message.text,
          reply_to_message_id: body.message_id,
        }
      );

      reply.status(200);
      return reply.send();
    }
  );

  done();
};

export default base;
