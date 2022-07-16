import type { FastifyPluginCallback, RouteShorthandMethod } from "fastify";
import type { TelegramRequestBody } from "@/services/telegram/telegram.type";
import { handleMessage } from "./service";

const TELEGRAM_ROUTE_SECRET_TOKEN = process.env.TELEGRAM_ROUTE_SECRET_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const routes: FastifyPluginCallback = (app, _, done) => {
  type TelegramWebhookHandler = RouteShorthandMethod & {
    Params: { secretToken: string };
    Body: TelegramRequestBody;
  };

  app.post<TelegramWebhookHandler>(
    "/webhook/:secretToken",
    async (request, reply) => {
      const { body, params, log } = request;
      const message = body.message ? body.message : body.edited_message;

      if (!message) {
        // TODO(telegram): add log alert through telegram
        log.fatal(
          {
            incomingRequest: request,
          },
          "The unknown request without telegram message type"
        );
        return reply.status(403).send();
      }

      const isChatID = message.chat.id.toString() === TELEGRAM_CHAT_ID;
      const isSecretRoute = params.secretToken === TELEGRAM_ROUTE_SECRET_TOKEN;

      if (!isChatID || !isSecretRoute) {
        // TODO(telegram): add log alert through telegram
        log.fatal(
          {
            incomingRequest: request,
          },
          "The unknown chat ID or someone knows `secretToken`"
        );
        return reply.status(403).send();
      }

      await handleMessage(message);

      return reply.status(200).send();
    }
  );

  type CloudScheduleParams = RouteShorthandMethod & { Body: {} };

  app.post<CloudScheduleParams>("/schedule/", async ({ log }, reply) => {
    log.info("hello!");
    return reply.status(200).send();
  });

  done();
};

export default routes;
