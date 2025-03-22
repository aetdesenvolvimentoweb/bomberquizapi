/**
 * Testes unitários para a factory makeUserListService
 *
 * Este arquivo verifica se a factory cria corretamente uma instância do
 * UserListService com as dependências apropriadas.
 *
 * @group Unit
 * @group Factories
 * @group User
 */

// Mocks das dependências
jest.mock("@/data/services", () => ({
  UserListService: jest
    .fn()
    .mockImplementation(({ userRepository, loggerProvider }) => ({
      userRepository,
      loggerProvider,
      list: jest.fn(),
    })),
}));

jest.mock("@/infra/repositories", () => ({
  PrismaUserRepository: jest.fn().mockImplementation(() => ({
    list: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  })),
}));

// Importar dependências após configurar os mocks
import { UserListService } from "@/data/services";
import { LoggerProvider } from "@/domain/providers";
import { PrismaUserRepository } from "@/infra/repositories";

import { makeUserListService } from "../make-user-list-service";

describe("makeUserListService", () => {
  // Mock do logger para passar como parâmetro
  const loggerProviderMock: jest.Mocked<LoggerProvider> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    log: jest.fn(),
    withContext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma instância do UserListService", () => {
    // Act
    const userListService = makeUserListService(loggerProviderMock);

    // Assert
    expect(userListService).toBeDefined();
    expect(UserListService).toHaveBeenCalledTimes(1);
  });

  it("deve criar o UserListService com um PrismaUserRepository", () => {
    // Act
    makeUserListService(loggerProviderMock);

    // Assert
    expect(PrismaUserRepository).toHaveBeenCalledTimes(1);
    expect(UserListService).toHaveBeenCalledWith(
      expect.objectContaining({
        userRepository: expect.any(Object),
      }),
    );
  });

  it("deve passar o loggerProvider fornecido para o UserListService", () => {
    // Act
    makeUserListService(loggerProviderMock);

    // Assert
    expect(UserListService).toHaveBeenCalledWith(
      expect.objectContaining({
        loggerProvider: loggerProviderMock,
      }),
    );
  });

  it("deve retornar uma instância pronta para uso do UserListService", () => {
    // Arrange
    const mockServiceInstance = {
      list: jest.fn().mockResolvedValue([]),
    };
    (UserListService as jest.Mock).mockReturnValue(mockServiceInstance);

    // Act
    const service = makeUserListService(loggerProviderMock);

    // Assert
    expect(service).toBe(mockServiceInstance);
    expect(service.list).toBeDefined();
  });

  it("deve criar um novo PrismaUserRepository a cada chamada", () => {
    // Act
    makeUserListService(loggerProviderMock);
    makeUserListService(loggerProviderMock);

    // Assert
    expect(PrismaUserRepository).toHaveBeenCalledTimes(2);
  });
});
