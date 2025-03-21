// src/main/routes/index.ts
import { FastifyInstance } from "fastify";

import { setupUserRoutes } from "./user-routes";

export const setupRoutes = (app: FastifyInstance): void => {
  setupUserRoutes(app);

  // Adicione outras rotas conforme necessário

  // Rota de saúde para verificar se a API está funcionando
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
};
