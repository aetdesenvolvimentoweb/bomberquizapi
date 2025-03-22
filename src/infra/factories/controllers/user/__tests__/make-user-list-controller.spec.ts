/**
 * Testes unitários para a factory makeUserListController
 *
 * Este arquivo verifica se a factory cria corretamente uma instância do
 * UserListController com as dependências apropriadas.
 *
 * @group Unit
 * @group Factories
 * @group Controllers
 */

// Mocks das dependências
jest.mock("@/infra/providers", () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock("@/infra/factories", () => ({
  makeUserListService: jest.fn().mockImplementation((logger) => ({
    logger,
    list: jest.fn(),
  })),
}));

jest.mock("@/presentation/controllers", () => ({
  UserListController: jest.fn().mockImplementation(({ userListService }) => ({
    userListService,
    handle: jest.fn(),
  })),
}));

// Importar dependências após configurar os mocks
import { makeUserListService } from "@/infra/factories";
import { ConsoleLogger } from "@/infra/providers";
import { UserListController } from "@/presentation/controllers";

import { makeUserListController } from "../make-user-list-controller";

describe("makeUserListController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma instância do UserListController", () => {
    // Act
    const controller = makeUserListController();

    // Assert
    expect(controller).toBeDefined();
    expect(UserListController).toHaveBeenCalledTimes(1);
  });

  it("deve criar um ConsoleLogger para injetar nas dependências", () => {
    // Act
    makeUserListController();

    // Assert
    expect(ConsoleLogger).toHaveBeenCalledTimes(1);
  });

  it("deve criar o UserListService usando a factory makeUserListService", () => {
    // Act
    makeUserListController();

    // Assert
    expect(makeUserListService).toHaveBeenCalledTimes(1);
    expect(makeUserListService).toHaveBeenCalledWith(expect.any(Object));
  });

  it("deve passar o logger criado para o makeUserListService", () => {
    // Arrange
    const mockLogger = { info: jest.fn() };
    (ConsoleLogger as jest.Mock).mockReturnValue(mockLogger);

    // Act
    makeUserListController();

    // Assert
    expect(makeUserListService).toHaveBeenCalledWith(mockLogger);
  });

  it("deve passar o UserListService criado para o UserListController", () => {
    // Arrange
    const mockService = { list: jest.fn() };
    (makeUserListService as jest.Mock).mockReturnValue(mockService);

    // Act
    makeUserListController();

    // Assert
    expect(UserListController).toHaveBeenCalledWith({
      userListService: mockService,
    });
  });

  it("deve retornar um objeto que implementa a interface Controller", () => {
    // Arrange
    const mockControllerInstance = {
      handle: jest.fn(),
    };
    (UserListController as jest.Mock).mockReturnValue(mockControllerInstance);

    // Act
    const controller = makeUserListController();

    // Assert
    expect(controller).toBe(mockControllerInstance);
    expect(controller.handle).toBeDefined();
  });

  it("deve criar novas instâncias de todas as dependências a cada chamada", () => {
    // Act
    makeUserListController();
    makeUserListController();

    // Assert
    expect(ConsoleLogger).toHaveBeenCalledTimes(2);
    expect(makeUserListService).toHaveBeenCalledTimes(2);
    expect(UserListController).toHaveBeenCalledTimes(2);
  });
});
