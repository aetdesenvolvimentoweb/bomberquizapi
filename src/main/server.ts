// src/main/server.ts
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import fastify, { FastifyInstance } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { setupRoutes } from "./routes";

export const app = fastify({
  logger: true,
});

export const setupServer = async (): Promise<
  FastifyInstance<Server, IncomingMessage, ServerResponse>
> => {
  // Registrar plugins
  await app.register(cors, {
    origin: true, // Permitir todas origens em desenvolvimento
  });

  await app.register(sensible);

  // Configurar rotas
  setupRoutes(app);

  return app;
};

export const startServer = async (port = 3000): Promise<void> => {
  try {
    const server = await setupServer();
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Iniciar o servidor se este arquivo for executado diretamente
/* istanbul ignore next */
if (require.main === module) {
  startServer();
}
