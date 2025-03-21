/**
 * Testes unitários para o UserCreateController
 *
 * Este arquivo contém testes que verificam o comportamento do controlador
 * responsável pela criação de usuários, incluindo o fluxo feliz e
 * cenários de erro.
 *
 * @group Unit
 * @group Controllers
 * @group User
 */

import { UserCreateService } from "@/data/services";
import { UserCreateData } from "@/domain/entities";
import { DuplicateResourceError } from "@/domain/errors";
import { UserCreateController } from "@/presentation/controllers";
import { HttpRequest } from "@/presentation/protocols";

// Mock do serviço de criação de usuário
const mockCreate = jest.fn();
const mockUserCreateService = {
  create: mockCreate,
};

describe("UserCreateController", () => {
  let userCreateController: UserCreateController;
  let userData: UserCreateData;
  let httpRequest: HttpRequest<UserCreateData>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create controller instance with mocked dependencies
    // Usamos um type assertion para contornar o problema de tipagem
    // Isso é seguro no contexto de testes, pois estamos apenas mockando a interface
    userCreateController = new UserCreateController({
      userCreateService: mockUserCreateService as unknown as UserCreateService,
    });

    // Sample user data
    userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "Password123!",
      phone: "(11) 98765-4321",
      birthdate: new Date("1990-01-01"),
    };

    // Sample HTTP request
    httpRequest = {
      body: userData,
    };

    // Default mock implementation
    mockCreate.mockResolvedValue(undefined);
  });

  describe("handle method", () => {
    /**
     * Verifica se o controlador retorna status 201 e resposta de sucesso
     * quando o usuário é criado com sucesso
     */
    it("deve retornar 201 e success=true quando o usuário é criado com sucesso", async () => {
      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(201);
      expect(httpResponse.body.success).toBe(true);
      expect(httpResponse.body.metadata.timestamp).toBeDefined();

      // Verify service was called with correct data
      expect(mockCreate).toHaveBeenCalledWith(userData);
    });

    /**
     * Verifica se o controlador retorna status 400 quando não há corpo na requisição
     */
    it("deve retornar 400 quando a requisição não contém um corpo", async () => {
      // Arrange
      const requestWithoutBody: HttpRequest = {};

      // Act
      const httpResponse =
        await userCreateController.handle(requestWithoutBody);

      // Assert
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toBe(
        "Parâmetro obrigatório não informado: corpo da requisição não informado",
      );

      // Verify service was not called
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("deve retornar o status adequado quando ocorre um ApplicationError", async () => {
      // Arrange
      const duplicateError = new DuplicateResourceError("e-mail");
      mockCreate.mockRejectedValue(duplicateError);

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(409); // Conflict status from DuplicateResourceError
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toBe(
        "E-mail já cadastrado no sistema",
      );
    });

    it("deve retornar 500 quando ocorre um erro não tratado (Error)", async () => {
      // Arrange
      const unexpectedError = new Error("Erro inesperado");
      mockCreate.mockRejectedValue(unexpectedError);

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toContain("Erro inesperado");
    });

    it("deve retornar 500 quando ocorre um erro não tratado (não-Error)", async () => {
      // Arrange - usando um objeto simples como erro
      const nonErrorObject = { message: "Erro inesperado" };
      mockCreate.mockRejectedValue(nonErrorObject);

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toContain("Erro inesperado");
    });

    it("deve incluir timestamp na resposta em todos os cenários", async () => {
      // Act - Success case
      const successResponse = await userCreateController.handle(httpRequest);

      // Arrange error case
      mockCreate.mockRejectedValue(new Error("Qualquer erro"));

      // Act - Error case
      const errorResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(successResponse.body.metadata.timestamp).toBeDefined();
      expect(errorResponse.body.metadata.timestamp).toBeDefined();

      // Verify timestamps are in ISO format
      expect(Date.parse(successResponse.body.metadata.timestamp)).not.toBeNaN();
      expect(Date.parse(errorResponse.body.metadata.timestamp)).not.toBeNaN();
    });
  });
});
