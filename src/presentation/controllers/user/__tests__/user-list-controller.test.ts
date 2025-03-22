/**
 * Testes de integração para o UserListController
 *
 * Este arquivo testa a integração entre o controlador, serviço e repositório
 * usando implementações em memória para simular o comportamento real.
 *
 * @group Integration
 * @group Controllers
 * @group User
 */

import { InMemoryUserRepository } from "@/data/repositories";
import { UserListService } from "@/data/services";
import { UserCreateData, UserMapped, UserRole } from "@/domain/entities";
import { LoggerProvider } from "@/domain/providers";
import { HttpRequest } from "@/presentation/protocols";

import { UserListController } from "../user-list-controller";

// Implementação simples do LoggerProvider para testes
class TestLoggerProvider implements LoggerProvider {
  logs: Array<{ level: string; message: string }> = [];

  info(message: string): void {
    this.logs.push({ level: "info", message });
  }

  error(message: string): void {
    this.logs.push({ level: "error", message });
  }

  warn(message: string): void {
    this.logs.push({ level: "warn", message });
  }

  debug(message: string): void {
    this.logs.push({ level: "debug", message });
  }
}

describe("UserListController - Integration Tests", () => {
  let userRepository: InMemoryUserRepository;
  let loggerProvider: TestLoggerProvider;
  let userListService: UserListService;
  let controller: UserListController;

  // Dados de teste para usuários
  const testUsers: UserCreateData[] = [
    {
      name: "João Silva",
      email: "joao@example.com",
      phone: "+5511987654321",
      birthdate: new Date("1990-01-01"),
      password: "Senha@123",
    },
    {
      name: "Maria Oliveira",
      email: "maria@example.com",
      phone: "+5511912345678",
      birthdate: new Date("1992-05-15"),
      password: "Senha@456",
    },
  ];

  beforeEach(async () => {
    // Criar instâncias reais das dependências
    userRepository = new InMemoryUserRepository();
    loggerProvider = new TestLoggerProvider();

    // Criar o serviço com as dependências reais
    userListService = new UserListService({
      userRepository,
      loggerProvider,
    });

    // Criar o controlador com o serviço real
    controller = new UserListController({
      userListService,
    });

    // Pré-popular o repositório com dados de teste
    for (const userData of testUsers) {
      await userRepository.create(userData);
    }
  });

  it("deve retornar a lista de usuários com status 200", async () => {
    // Act
    const httpRequest: HttpRequest = {};
    const httpResponse = await controller.handle(httpRequest);

    // Assert
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.success).toBe(true);

    // Verificar se retornou os usuários corretos
    const users = httpResponse.body.data as UserMapped[];
    expect(users).toHaveLength(2);

    // Verificar os dados retornados
    expect(users[0].email).toBe("joao@example.com");
    expect(users[1].email).toBe("maria@example.com");

    // Verificar se os campos sensíveis foram removidos
    users.forEach((user) => {
      expect(user.password).toBeUndefined();
      expect(user.role).toBe(UserRole.CLIENTE);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    // Verificar se os logs foram registrados corretamente
    expect(loggerProvider.logs).toHaveLength(2);
    expect(loggerProvider.logs[0].level).toBe("info");
    expect(loggerProvider.logs[0].message).toContain(
      "Iniciando listagem de usuários",
    );
    expect(loggerProvider.logs[1].level).toBe("info");
    expect(loggerProvider.logs[1].message).toContain(
      "Listagem de usuários concluída com sucesso. Total: 2 usuários encontrados",
    );
  });

  it("deve retornar uma lista vazia quando não há usuários", async () => {
    // Arrange - criar um novo repositório vazio
    const emptyRepository = new InMemoryUserRepository();
    const emptyService = new UserListService({
      userRepository: emptyRepository,
      loggerProvider,
    });
    const emptyController = new UserListController({
      userListService: emptyService,
    });

    // Act
    const httpResponse = await emptyController.handle({});

    // Assert
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.success).toBe(true);
    expect(httpResponse.body.data).toEqual([]);
  });

  it("deve manter a estrutura de resposta HTTP correta", async () => {
    // Act
    const httpResponse = await controller.handle({});

    // Assert
    expect(httpResponse).toHaveProperty("statusCode");
    expect(httpResponse).toHaveProperty("body");
    expect(httpResponse.body).toHaveProperty("success");
    expect(httpResponse.body).toHaveProperty("data");
    expect(httpResponse.body).toHaveProperty("metadata");
    expect(httpResponse.body.metadata).toHaveProperty("timestamp");
  });
});
