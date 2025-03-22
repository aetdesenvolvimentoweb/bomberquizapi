/**
 * Testes unitários para a classe UserListService
 *
 * Este arquivo contém testes que verificam o comportamento do serviço
 * de listagem de usuários.
 *
 * @group Unit
 * @group Services
 * @group User
 */

import { UserListService } from "@/data/services/user/user-list";
import { UserMapped, UserRole } from "@/domain/entities";
import { ServerError } from "@/domain/errors";
import { LoggerProvider } from "@/domain/providers";
import { UserRepository } from "@/domain/repositories";

describe("UserListService", () => {
  // Mocks das dependências
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let loggerProviderMock: jest.Mocked<LoggerProvider>;
  let userListService: UserListService;

  // Dados de teste
  const mockUsers: UserMapped[] = [
    {
      id: "user-id-1",
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
      id: "user-id-2",
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
    // Configuração dos mocks para cada teste
    userRepositoryMock = {
      list: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as jest.Mocked<UserRepository>;

    loggerProviderMock = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      trace: jest.fn(),
      withContext: jest.fn(),
    } as jest.Mocked<LoggerProvider>;

    // Criação da instância do serviço com os mocks
    userListService = new UserListService({
      userRepository: userRepositoryMock,
      loggerProvider: loggerProviderMock,
    });
  });

  describe("list method", () => {
    it("deve retornar uma lista de usuários quando executado com sucesso", async () => {
      // Arrange
      userRepositoryMock.list.mockResolvedValue(mockUsers);

      // Act
      const result = await userListService.list();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(userRepositoryMock.list).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.info).toHaveBeenCalledTimes(2);
      expect(loggerProviderMock.info).toHaveBeenNthCalledWith(
        1,
        "Iniciando listagem de usuários",
      );
      expect(loggerProviderMock.info).toHaveBeenNthCalledWith(
        2,
        "Listagem de usuários concluída com sucesso. Total: 2 usuários encontrados",
      );
    });

    it("deve retornar uma lista vazia quando não há usuários", async () => {
      // Arrange
      userRepositoryMock.list.mockResolvedValue([]);

      // Act
      const result = await userListService.list();

      // Assert
      expect(result).toEqual([]);
      expect(userRepositoryMock.list).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.info).toHaveBeenNthCalledWith(
        2,
        "Listagem de usuários concluída com sucesso. Total: 0 usuários encontrados",
      );
    });

    it("deve lançar ServerError quando ocorre uma exceção do tipo Error", async () => {
      // Arrange
      const error = new Error("Erro ao acessar o banco de dados");
      userRepositoryMock.list.mockRejectedValue(error);

      // Act & Assert
      await expect(userListService.list()).rejects.toThrow(ServerError);
      expect(userRepositoryMock.list).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.error).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.error).toHaveBeenCalledWith(
        "Erro ao listar usuários: Erro ao acessar o banco de dados",
      );
    });

    it("deve lançar ServerError quando ocorre uma exceção que não é do tipo Error", async () => {
      // Arrange - Simulando um erro que não é instância de Error
      const nonErrorValue = "String de erro sem stack trace";
      userRepositoryMock.list.mockRejectedValue(nonErrorValue);

      // Act & Assert
      await expect(userListService.list()).rejects.toThrow(ServerError);
      expect(userRepositoryMock.list).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.error).toHaveBeenCalledTimes(1);
      expect(loggerProviderMock.error).toHaveBeenCalledWith(
        "Erro ao listar usuários: Erro desconhecido",
      );
    });

    it("deve registrar logs apropriados durante o ciclo de vida da operação", async () => {
      // Arrange
      userRepositoryMock.list.mockResolvedValue(mockUsers);

      // Act
      await userListService.list();

      // Assert
      // Verifica a sequência e conteúdo dos logs
      expect(loggerProviderMock.info).toHaveBeenCalledTimes(2);
      // Verifica se o primeiro log é sobre o início da operação
      expect(loggerProviderMock.info).toHaveBeenNthCalledWith(
        1,
        "Iniciando listagem de usuários",
      );
      // Verifica se o segundo log é sobre a conclusão da operação
      expect(loggerProviderMock.info).toHaveBeenNthCalledWith(
        2,
        "Listagem de usuários concluída com sucesso. Total: 2 usuários encontrados",
      );
    });
  });
});
