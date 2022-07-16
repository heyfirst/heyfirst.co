import type { FastifyPluginCallback, RouteShorthandMethod } from "fastify";
import telegram from "@/services/telegram";

type TelegramMessage = {
  message_id: number;
  text: string;
  date: number;
  edit_date?: number;
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
};

type TelegramRequestBody = {
  edited_message?: TelegramMessage;
  message?: TelegramMessage;
};

type TelegramWebhookHandler = RouteShorthandMethod & {
  Params: { secretToken: string };
  Body: TelegramRequestBody;
};

const TELEGRAM_ROUTE_SECRET_TOKEN = process.env.TELEGRAM_ROUTE_SECRET_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const base: FastifyPluginCallback = (app, _, done) => {
  app.post<TelegramWebhookHandler>(
    "/webhook/:secretToken",
    async ({ body, params, log }, reply) => {
      // FIXME: delete after settle
      log.info(
        {
          telegramPayload: body,
        },
        "telegram req"
      );

      const message = body.message ? body.message : body.edited_message;

      if (!message) return reply.status(200).send();

      const isChatID = message.chat.id.toString() === TELEGRAM_CHAT_ID;
      const isSecretRoute = params.secretToken === TELEGRAM_ROUTE_SECRET_TOKEN;

      if (!isChatID || !isSecretRoute) {
        reply.status(403);
        return reply.send();
      }

      telegram.sendTextMessage({
        text: message.text,
        replyToMessageID: message.message_id,
      });

      return reply.status(200).send();
    }
  );

  done();
};

export default base;
