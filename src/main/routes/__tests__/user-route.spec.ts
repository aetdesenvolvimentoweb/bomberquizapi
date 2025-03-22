// src/main/routes/__tests__/user-route.spec.ts
import { FastifyInstance } from "fastify";

import { fastifyRouteAdapter } from "@/infra/adapters";
import { makeUserCreateController } from "@/infra/factories/controllers";
import { makeUserListController } from "@/infra/factories/controllers";

import { setupUserRoutes } from "../user-routes";

// Mocks manuais em vez de jest.mock()
jest.mock("@/infra/factories/controllers");
jest.mock("@/infra/adapters");

describe("User Routes", () => {
  let mockApp: FastifyInstance;
  let mockController: { handle: jest.Mock };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adaptedHandler: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Configurar mock do controller
    mockController = { handle: jest.fn() };
    (makeUserCreateController as jest.Mock).mockReturnValue(mockController);
    (makeUserListController as jest.Mock).mockReturnValue(mockController);

    // Configurar mock do adapter
    adaptedHandler = { adapted: true };
    (fastifyRouteAdapter as jest.Mock).mockImplementation(() => adaptedHandler);

    // Configurar mock do app
    mockApp = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as FastifyInstance;
  });

  it("deve registrar a rota POST /api/users corretamente", () => {
    // Executar função que configura as rotas
    setupUserRoutes(mockApp);

    // Verificações
    expect(makeUserCreateController).toHaveBeenCalledTimes(1);
    expect(fastifyRouteAdapter).toHaveBeenCalledWith(mockController);
    expect(mockApp.post).toHaveBeenCalledWith("/api/users", adaptedHandler);
  });

  it("não deve registrar outras rotas", () => {
    setupUserRoutes(mockApp);

    expect(mockApp.get).not.toHaveBeenCalled();
    expect(mockApp.put).not.toHaveBeenCalled();
    expect(mockApp.delete).not.toHaveBeenCalled();
  });
});
