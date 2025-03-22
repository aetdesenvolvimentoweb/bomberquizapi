/**
 * Testes unitários para o UserListController
 */

import { UserListService } from "@/data/services";
import { UserMapped, UserRole } from "@/domain/entities";
import { ServerError } from "@/domain/errors";
import { HttpRequest } from "@/presentation/protocols";

import { UserListController } from "../user-list-controller";

// Mock das funções helpers
jest.mock("@/presentation/helpers", () => {
  return {
    ok: jest.fn((data) => {
      // Retorno explícito ao invés de chamada de função
      return {
        statusCode: 200,
        body: {
          success: true,
          data,
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
    }),
    handleError: jest.fn((error) => {
      // Retorno explícito ao invés de chamada de função
      return {
        statusCode: error.statusCode || 500,
        body: {
          success: false,
          errorMessage: error.message || "Unknown error",
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
    }),
  };
});

// Importar após o mock
import { handleError, ok } from "@/presentation/helpers";

describe("UserListController", () => {
  let userListServiceMock: jest.Mocked<UserListService>;
  let controller: UserListController;

  // Dados de teste
  const mockUsers: UserMapped[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      phone: "+5511987654321",
      birthdate: new Date("1990-01-01"),
      avatarUrl: "https://example.com/avatar.jpg",
      role: "CLIENTE" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      phone: "+5511912345678",
      birthdate: new Date("1992-05-15"),
      avatarUrl: "https://example.com/avatar2.jpg",
      role: "CLIENTE" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mock do serviço
    userListServiceMock = {
      list: jest.fn(),
    } as unknown as jest.Mocked<UserListService>;

    // Criar o controlador com as dependências mockadas
    controller = new UserListController({
      userListService: userListServiceMock,
    });
  });

  describe("handle method", () => {
    it("deve chamar userListService.list e retornar os usuários com status 200", async () => {
      // Arrange
      userListServiceMock.list.mockResolvedValue(mockUsers);
      const successResponse = {
        statusCode: 200,
        body: {
          success: true,
          data: mockUsers,
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
      (ok as jest.Mock).mockReturnValue(successResponse);

      // Act
      const httpRequest: HttpRequest = {};
      const httpResponse = await controller.handle(httpRequest);

      // Assert
      expect(userListServiceMock.list).toHaveBeenCalledTimes(1);
      expect(ok).toHaveBeenCalledWith(mockUsers);
      expect(httpResponse).toBe(successResponse);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body.data).toEqual(mockUsers);
    });

    it("deve retornar um array vazio quando não existirem usuários", async () => {
      // Arrange
      userListServiceMock.list.mockResolvedValue([]);
      const emptyResponse = {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
      (ok as jest.Mock).mockReturnValue(emptyResponse);

      // Act
      const httpResponse = await controller.handle({});

      // Assert
      expect(userListServiceMock.list).toHaveBeenCalledTimes(1);
      expect(ok).toHaveBeenCalledWith([]);
      expect(httpResponse).toBe(emptyResponse);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body.data).toEqual([]);
    });

    it("deve chamar handleError quando userListService.list lançar uma exceção", async () => {
      // Arrange
      const error = new ServerError(new Error("Falha ao listar usuários"));
      userListServiceMock.list.mockRejectedValue(error);
      const errorResponse = {
        statusCode: 500,
        body: {
          success: false,
          errorMessage: "Erro inesperado do servidor. Falha ao listar usuários",
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
      (handleError as jest.Mock).mockReturnValue(errorResponse);

      // Act
      const httpResponse = await controller.handle({});

      // Assert
      expect(userListServiceMock.list).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalledWith(error);
      expect(httpResponse).toBe(errorResponse);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body.success).toBe(false);
    });

    it("deve processar a requisição sem considerar o corpo da requisição", async () => {
      // Arrange
      userListServiceMock.list.mockResolvedValue(mockUsers);
      const successResponse = {
        statusCode: 200,
        body: {
          success: true,
          data: mockUsers,
          metadata: { timestamp: "2023-01-01T00:00:00.000Z" },
        },
      };
      (ok as jest.Mock).mockReturnValue(successResponse);

      const httpRequest = {
        body: { someData: "value" },
        params: { id: "123" },
      };

      // Act
      const httpResponse = await controller.handle(httpRequest);

      // Assert
      expect(userListServiceMock.list).toHaveBeenCalledTimes(1);
      expect(userListServiceMock.list).toHaveBeenCalledWith();
      expect(httpResponse.statusCode).toBe(200);
    });
  });
});
