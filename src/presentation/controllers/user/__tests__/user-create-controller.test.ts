/**
 * Testes de integração para o UserCreateController
 *
 * Este arquivo contém testes que verificam a integração entre o controlador
 * e o serviço de criação de usuário, respeitando as fronteiras da arquitetura limpa.
 *
 * @group Integration
 * @group Controllers
 * @group User
 */

import { UserCreateService } from "@/data/services";
import { UserCreateData } from "@/domain/entities";
import { DuplicateResourceError, ServerError } from "@/domain/errors";
import { LoggerProvider } from "@/domain/providers";
import { HashProvider } from "@/domain/providers";
import { UserRepository } from "@/domain/repositories";
import { UserCreateDataSanitizerUseCase } from "@/domain/sanitizers";
import { UserCreateDataValidatorUseCase } from "@/domain/validators";
import { UserCreateController } from "@/presentation/controllers";
import { HttpRequest } from "@/presentation/protocols";

describe("UserCreateController (Integration)", () => {
  // Mocks para as dependências
  const mockUserRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockUserCreateDataSanitizer: jest.Mocked<UserCreateDataSanitizerUseCase> =
    {
      sanitize: jest.fn(),
    };

  const mockUserCreateDataValidator: jest.Mocked<UserCreateDataValidatorUseCase> =
    {
      validate: jest.fn(),
    };

  const mockHashProvider: jest.Mocked<HashProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
    withOptions: jest.fn(),
  };

  const mockLoggerProvider: jest.Mocked<LoggerProvider> = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    withContext: jest.fn(),
  };

  // Componentes reais que serão usados nos testes
  let userCreateService: UserCreateService;
  let userCreateController: UserCreateController;

  // Dados de teste
  let userData: UserCreateData;
  let httpRequest: HttpRequest<UserCreateData>;

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();

    // Configurar comportamento padrão dos mocks
    mockLoggerProvider.withContext.mockReturnValue(mockLoggerProvider);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserCreateDataSanitizer.sanitize.mockImplementation((data) => {
      // Simular sanitização básica
      if (!data) return {} as UserCreateData;
      return {
        ...data,
        name: data.name?.trim().replace(/\s+/g, " ") || "",
        email: data.email?.trim().toLowerCase() || "",
        phone: data.phone?.replace(/[^\d+]/g, "") || "",
      };
    });
    mockHashProvider.hash.mockResolvedValue("hashed_password");

    // Inicializar o serviço de criação de usuário com mocks
    userCreateService = new UserCreateService({
      userRepository: mockUserRepository,
      userCreateDataSanitizer: mockUserCreateDataSanitizer,
      userCreateDataValidator: mockUserCreateDataValidator,
      hashProvider: mockHashProvider,
      loggerProvider: mockLoggerProvider,
    });

    // Inicializar o controlador com o serviço real
    userCreateController = new UserCreateController({
      userCreateService,
    });

    // Dados de teste
    userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "Password123!",
      phone: "(11) 98765-4321",
      birthdate: new Date("1990-01-01"),
    };

    // Requisição HTTP
    httpRequest = {
      body: userData,
    };
  });

  describe("Fluxo de criação de usuário", () => {
    it("deve criar um usuário com sucesso e retornar status 201", async () => {
      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(201);
      expect(httpResponse.body.success).toBe(true);
      expect(httpResponse.body.metadata.timestamp).toBeDefined();

      // Verificar se o serviço foi chamado com os dados corretos
      expect(mockUserCreateDataSanitizer.sanitize).toHaveBeenCalledWith(
        userData,
      );
      expect(mockUserCreateDataValidator.validate).toHaveBeenCalled();
      expect(mockHashProvider.hash).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
          password: "hashed_password", // Senha hasheada
        }),
      );
    });

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

      // Verificar que o serviço não foi chamado
      expect(mockUserCreateDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("deve retornar 409 quando tenta criar um usuário com email já existente", async () => {
      // Arrange - Configurar o validador para lançar erro de duplicação
      mockUserCreateDataValidator.validate.mockImplementationOnce(() => {
        throw new DuplicateResourceError("e-mail");
      });

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(409); // Conflict
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toBe(
        "E-mail já cadastrado no sistema",
      );

      // Verificar que o repositório não foi chamado para criar
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("deve sanitizar os dados do usuário antes de criar", async () => {
      // Arrange - Dados com espaços extras e formatação inconsistente
      const dirtyUserData: UserCreateData = {
        name: "  John   Doe  ", // Espaços extras
        email: "JOHN.DOE2@EXAMPLE.COM  ", // Maiúsculas e espaços
        password: "Password123!",
        phone: "(11) 9.8765-4321", // Formatação inconsistente
        birthdate: new Date("1990-01-01"),
      };

      const dirtyRequest: HttpRequest<UserCreateData> = {
        body: dirtyUserData,
      };

      // Act
      const httpResponse = await userCreateController.handle(dirtyRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(201);

      // Verificar que o sanitizador foi chamado com os dados corretos
      expect(mockUserCreateDataSanitizer.sanitize).toHaveBeenCalledWith(
        dirtyUserData,
      );

      // Verificar que o repositório foi chamado com os dados sanitizados
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john.doe2@example.com",
          phone: "11987654321",
        }),
      );
    });
  });

  describe("Tratamento de erros", () => {
    it("deve retornar 500 quando ocorre um erro não tratado", async () => {
      // Arrange - Forçar um erro no serviço
      mockUserCreateDataValidator.validate.mockImplementationOnce(() => {
        throw new Error("Erro inesperado");
      });

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toContain("Erro inesperado");
    });

    it("deve propagar corretamente erros de aplicação do serviço", async () => {
      // Arrange - Forçar um erro específico no serviço
      mockUserCreateDataValidator.validate.mockImplementationOnce(() => {
        throw new DuplicateResourceError("e-mail");
      });

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(409); // Conflict
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toBe(
        "E-mail já cadastrado no sistema",
      );
    });

    it("deve tratar corretamente erros do tipo ServerError", async () => {
      // Arrange - Forçar um erro de servidor
      mockUserCreateDataValidator.validate.mockImplementationOnce(() => {
        throw new ServerError(new Error("Erro interno"));
      });

      // Act
      const httpResponse = await userCreateController.handle(httpRequest);

      // Assert
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body.success).toBe(false);
      expect(httpResponse.body.errorMessage).toContain(
        "Erro inesperado do servidor",
      );
    });
  });
});
