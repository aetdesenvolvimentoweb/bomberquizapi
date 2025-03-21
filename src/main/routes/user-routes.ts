import { FastifyInstance } from "fastify";

import { fastifyRouteAdapter } from "@/infra/adapters";
import { makeUserCreateController } from "@/infra/factories/controllers";

export const setupUserRoutes = (app: FastifyInstance): void => {
  app.post("/api/users", fastifyRouteAdapter(makeUserCreateController()));
};
