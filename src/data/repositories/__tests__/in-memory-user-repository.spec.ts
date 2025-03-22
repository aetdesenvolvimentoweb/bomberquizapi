/**
 * Testes unitários para a classe InMemoryUserRepository
 *
 * Este arquivo contém testes que verificam o comportamento da implementação
 * em memória do repositório de usuários, utilizada principalmente em testes.
 *
 * @group Unit
 * @group Repositories
 * @group Data
 */

import { InMemoryUserRepository } from "@/data/repositories";
import { UserCreateData, UserRole } from "@/domain/entities";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;

  // Dados de teste para um usuário
  const userData: UserCreateData = {
    name: "João Silva",
    email: "joao@example.com",
    phone: "+5511987654321",
    birthdate: new Date("1990-01-01"),
    password: "Senha@123",
  };

  beforeEach(() => {
    // Cria uma nova instância do repositório para cada teste
    repository = new InMemoryUserRepository();
  });

  describe("create method", () => {
    it("deve criar um usuário em memória com os dados fornecidos", async () => {
      // Arrange - dados já definidos no setup

      // Act
      await repository.create(userData);

      // Assert - vamos verificar indiretamente buscando o usuário
      const foundUser = await repository.findByEmail(userData.email);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.name).toBe(userData.name);
      expect(foundUser?.email).toBe(userData.email);
    });

    it("deve gerar um ID único para o usuário criado", async () => {
      // Arrange - dados já definidos no setup

      // Act
      await repository.create(userData);

      // Assert
      const user = await repository.findByEmail(userData.email);
      expect(user?.id).toBeDefined();
      expect(typeof user?.id).toBe("string");
      expect(user?.id.length).toBeGreaterThan(0);
    });

    it("deve definir valores padrão para os campos opcionais", async () => {
      // Arrange - dados já definidos no setup

      // Act
      await repository.create(userData);

      // Assert
      const user = await repository.findByEmail(userData.email);
      expect(user?.role).toBe(UserRole.CLIENTE);
      expect(user?.avatarUrl).toBeDefined();
      expect(user?.createdAt).toBeInstanceOf(Date);
      expect(user?.updatedAt).toBeInstanceOf(Date);
    });

    it("deve criar múltiplos usuários quando chamado múltiplas vezes", async () => {
      // Arrange
      const secondUser: UserCreateData = {
        name: "Maria Oliveira",
        email: "maria@example.com",
        phone: "+5511912345678",
        birthdate: new Date("1992-05-15"),
        password: "Senha@456",
      };

      // Act
      await repository.create(userData);
      await repository.create(secondUser);

      // Assert
      const user1 = await repository.findByEmail(userData.email);
      const user2 = await repository.findByEmail(secondUser.email);

      expect(user1).not.toBeNull();
      expect(user2).not.toBeNull();
      expect(user1?.id).not.toBe(user2?.id);
    });
  });

  describe("findByEmail method", () => {
    it("deve retornar null quando o email não existe", async () => {
      // Arrange - repositório vazio

      // Act
      const result = await repository.findByEmail("naoexiste@example.com");

      // Assert
      expect(result).toBeNull();
    });

    it("deve retornar o usuário quando o email existe", async () => {
      // Arrange
      await repository.create(userData);

      // Act
      const result = await repository.findByEmail(userData.email);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.email).toBe(userData.email);
      expect(result?.name).toBe(userData.name);
    });

    it("deve fazer busca case-sensitive no email", async () => {
      // Arrange
      await repository.create(userData);

      // Act
      const result = await repository.findByEmail(userData.email.toUpperCase());

      // Assert
      expect(result).toBeNull();
    });
  });

  // Nova seção de testes para o método list
  describe("list method", () => {
    it("deve retornar um array vazio quando não houver usuários", async () => {
      // Arrange - repositório vazio

      // Act
      const users = await repository.list();

      // Assert
      expect(users).toEqual([]);
    });

    it("deve retornar todos os usuários cadastrados", async () => {
      // Arrange
      const secondUser: UserCreateData = {
        name: "Maria Oliveira",
        email: "maria@example.com",
        phone: "+5511912345678",
        birthdate: new Date("1992-05-15"),
        password: "Senha@456",
      };

      await repository.create(userData);
      await repository.create(secondUser);

      // Act
      const users = await repository.list();

      // Assert
      expect(users.length).toBe(2);
      expect(users[0].name).toBe(userData.name);
      expect(users[1].name).toBe(secondUser.name);
    });

    it("deve retornar usuários mapeados sem incluir a senha", async () => {
      // Arrange
      await repository.create(userData);

      // Act
      const users = await repository.list();

      // Assert
      expect(users.length).toBe(1);
      expect(users[0].email).toBe(userData.email);
      // Verificar que a senha não está sendo retornada
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((users[0] as any).password).toBeUndefined();
    });

    it("deve retornar usuários com todos os campos mapeados corretamente", async () => {
      // Arrange
      await repository.create(userData);

      // Act
      const users = await repository.list();
      const user = users[0];

      // Assert
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.phone).toBe(userData.phone);
      expect(user.birthdate).toEqual(userData.birthdate);
      expect(user.avatarUrl).toBeDefined();
      expect(user.role).toBe(UserRole.CLIENTE);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("comportamento do repositório", () => {
    it("deve manter os dados entre diferentes chamadas de métodos", async () => {
      // Arrange
      await repository.create(userData);

      // Act & Assert - Verificações múltiplas no mesmo repositório
      let user = await repository.findByEmail(userData.email);
      expect(user).not.toBeNull();

      // Verificar novamente para confirmar persistência
      user = await repository.findByEmail(userData.email);
      expect(user).not.toBeNull();
    });

    it("deve manter isolamento entre diferentes instâncias do repositório", async () => {
      // Arrange
      await repository.create(userData);

      // Criar uma nova instância do repositório
      const anotherRepository = new InMemoryUserRepository();

      // Act & Assert
      // A nova instância não deve conter os dados da instância anterior
      const result = await anotherRepository.findByEmail(userData.email);
      expect(result).toBeNull();
    });
  });
});
