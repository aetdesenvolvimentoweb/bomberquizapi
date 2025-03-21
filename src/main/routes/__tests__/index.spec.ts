// src/main/routes/__tests__/index.spec.ts
import { FastifyInstance } from "fastify";

import { setupRoutes } from "../index";
import { setupUserRoutes } from "../user-routes";

// Mock das dependências
jest.mock("../user-routes");

describe("Setup Routes", () => {
  let mockApp: FastifyInstance;

  beforeEach(() => {
    // Limpar os mocks
    jest.clearAllMocks();

    // Criar mock do app Fastify
    mockApp = {
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      put: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    } as unknown as FastifyInstance;
  });

  it("deve configurar a rota de saúde (health)", () => {
    // Executar a função setupRoutes
    setupRoutes(mockApp);

    // Verificar se a rota health foi registrada
    expect(mockApp.get).toHaveBeenCalledWith("/health", expect.any(Function));
  });

  it("deve chamar setupUserRoutes com a instância do app", () => {
    // Executar a função setupRoutes
    setupRoutes(mockApp);

    // Verificar se setupUserRoutes foi chamado com a instância correta do app
    expect(setupUserRoutes).toHaveBeenCalledWith(mockApp);
  });

  it("deve retornar informações de status quando a rota health é chamada", async () => {
    // Capturar o handler da rota health
    setupRoutes(mockApp);

    // Obter a função de handler da segunda chamada para mockApp.get (índice 0 para a primeira chamada)
    const healthHandler = (mockApp.get as jest.Mock).mock.calls[0][1];

    // Executar o handler
    const response = await healthHandler();

    // Verificar a resposta
    expect(response).toHaveProperty("status", "ok");
    expect(response).toHaveProperty("timestamp");

    // Verificar que o timestamp é uma string ISO válida
    expect(typeof response.timestamp).toBe("string");
    expect(() => new Date(response.timestamp)).not.toThrow();
  });

  it("não deve registrar outras rotas diretamente no arquivo index", () => {
    // Execute a função setupRoutes
    setupRoutes(mockApp);

    // Verifique se o único método HTTP chamado foi GET (para a rota health)
    // Outros métodos HTTP (POST, PUT, DELETE) não devem ser chamados diretamente
    expect(mockApp.post).not.toHaveBeenCalled();
    expect(mockApp.put).not.toHaveBeenCalled();
    expect(mockApp.delete).not.toHaveBeenCalled();
  });
});
