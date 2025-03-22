/**
 * Testes de integração para a classe UserListService
 *
 * Este arquivo contém testes que verificam o comportamento do serviço
 * de listagem de usuários integrado com suas dependências.
 *
 * @group Integration
 * @group Services
 * @group User
 */

import { InMemoryUserRepository } from "@/data/repositories";
import { UserListService } from "@/data/services/user/user-list";
import { UserCreateData, UserRole } from "@/domain/entities";
import { ServerError } from "@/domain/errors";
import { LoggerProvider } from "@/domain/providers";

// Implementação do LoggerProvider para testes
class TestLoggerProvider implements LoggerProvider {
  public logs: Array<{ level: string; message: string }> = [];

  public info(message: string): void {
    this.logs.push({ level: "info", message });
  }

  public error(message: string): void {
    this.logs.push({ level: "error", message });
  }

  public warn(message: string): void {
    this.logs.push({ level: "warn", message });
  }

  public debug(message: string): void {
    this.logs.push({ level: "debug", message });
  }
}

describe("UserListService Integration Test", () => {
  let userRepository: InMemoryUserRepository;
  let loggerProvider: TestLoggerProvider;
  let userListService: UserListService;

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
    // Inicializar as dependências reais (ou de teste)
    userRepository = new InMemoryUserRepository();
    loggerProvider = new TestLoggerProvider();

    // Criar a instância do serviço com as dependências
    userListService = new UserListService({
      userRepository,
      loggerProvider,
    });

    // Limpar os logs antes de cada teste
    loggerProvider.logs = [];
  });

  describe("list method", () => {
    it("deve retornar uma lista vazia quando não há usuários cadastrados", async () => {
      // Act
      const result = await userListService.list();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);

      // Verificar logs
      expect(loggerProvider.logs).toHaveLength(2);
      expect(loggerProvider.logs[0]).toEqual({
        level: "info",
        message: "Iniciando listagem de usuários",
      });
      expect(loggerProvider.logs[1]).toEqual({
        level: "info",
        message:
          "Listagem de usuários concluída com sucesso. Total: 0 usuários encontrados",
      });
    });

    it("deve retornar a lista completa de usuários cadastrados", async () => {
      // Arrange - Cadastrar usuários para teste
      await userRepository.create(testUsers[0]);
      await userRepository.create(testUsers[1]);

      // Act
      const result = await userListService.list();

      // Assert
      expect(result).toHaveLength(2);

      // Verificar se os dados dos usuários estão corretos
      expect(result[0].name).toBe(testUsers[0].name);
      expect(result[0].email).toBe(testUsers[0].email);
      expect(result[1].name).toBe(testUsers[1].name);
      expect(result[1].email).toBe(testUsers[1].email);

      // Verificar se a senha não está incluída no resultado
      expect((result[0] as any).password).toBeUndefined();
      expect((result[1] as any).password).toBeUndefined();

      // Verificar campos gerados automaticamente
      expect(result[0].id).toBeDefined();
      expect(result[0].role).toBe(UserRole.CLIENTE);
      expect(result[0].avatarUrl).toBeDefined();
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);

      // Verificar logs
      expect(loggerProvider.logs).toHaveLength(2);
      expect(loggerProvider.logs[1]).toEqual({
        level: "info",
        message:
          "Listagem de usuários concluída com sucesso. Total: 2 usuários encontrados",
      });
    });

    it("deve lançar ServerError quando o repositório falha", async () => {
      // Arrange - Substituir a implementação do método list para simular falha
      const originalMethod = userRepository.list;
      userRepository.list = jest.fn().mockImplementation(() => {
        throw new Error("Falha simulada de acesso ao repositório");
      });

      // Act & Assert
      await expect(userListService.list()).rejects.toThrow(ServerError);

      // Verificar log de erro
      expect(loggerProvider.logs).toHaveLength(2); // Agora esperamos 2 logs
      expect(loggerProvider.logs[0]).toEqual({
        level: "info",
        message: "Iniciando listagem de usuários",
      });
      expect(loggerProvider.logs[1].level).toBe("error");
      expect(loggerProvider.logs[1].message).toContain(
        "Erro ao listar usuários",
      );
      expect(loggerProvider.logs[1].message).toContain(
        "Falha simulada de acesso ao repositório",
      );

      // Restaurar o método original para não interferir em outros testes
      userRepository.list = originalMethod;
    });

    it("deve lidar com erro não-Error corretamente", async () => {
      // Arrange - Substituir a implementação do método list para simular erro não-Error
      const originalMethod = userRepository.list;
      userRepository.list = jest.fn().mockImplementation(() => {
        throw "Este é um erro que não é instância de Error";
      });

      // Act & Assert
      await expect(userListService.list()).rejects.toThrow(ServerError);

      // Verificar log de erro
      expect(loggerProvider.logs).toHaveLength(2); // Agora esperamos 2 logs
      expect(loggerProvider.logs[0].level).toBe("info");
      expect(loggerProvider.logs[1].level).toBe("error");
      expect(loggerProvider.logs[1].message).toContain("Erro desconhecido");

      // Restaurar o método original para não interferir em outros testes
      userRepository.list = originalMethod;
    });
  });
});
