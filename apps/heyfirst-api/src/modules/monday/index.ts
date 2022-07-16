import { FastifyInstance } from "fastify";
import webhook from "./webhook";
export * as init from "./init";

export default (app: FastifyInstance) => {
  app.register(webhook, {
    prefix: "/monday",
  });
};
