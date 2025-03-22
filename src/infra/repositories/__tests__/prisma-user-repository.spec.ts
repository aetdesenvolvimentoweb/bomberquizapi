/**
 * Testes unitários para o PrismaUserRepository usando a abordagem
 * recomendada pelo Prisma para mocks
 */

import { User, UserCreateData, UserRole } from "@/domain/entities";
import { prismaMock } from "@/infra/adapters/singleton-prisma-client-adapter";

import { PrismaUserRepository } from "../prisma-user-repository";

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;

  // Dados de teste
  const mockUserData: UserCreateData = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+5511999999999",
    password: "password123",
    birthdate: new Date("1990-01-01"),
  };

  const mockUser: User = {
    id: "user-id-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+5511999999999",
    password: "password123",
    birthdate: new Date("1990-01-01"),
    avatarUrl: "https://example.com/avatar.jpg",
    role: "CLIENTE" as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Criar uma nova instância do repositório para cada teste
    repository = new PrismaUserRepository();
  });

  describe("create method", () => {
    it("deve chamar prisma.user.create com os dados corretos", async () => {
      // Arrange
      prismaMock.user.create.mockResolvedValue(mockUser);

      // Act
      await repository.create(mockUserData);

      // Assert
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: mockUserData,
      });
    });

    it("deve propagar erros do Prisma", async () => {
      // Arrange
      const error = new Error("Database error");
      prismaMock.user.create.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(mockUserData)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("findByEmail method", () => {
    it("deve retornar o usuário quando encontrado pelo email", async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await repository.findByEmail("john@example.com");

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        }),
      );
    });

    it("deve retornar null quando usuário não for encontrado", async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail("nonexistent@example.com");

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("list method", () => {
    it("deve retornar uma lista vazia quando não houver usuários", async () => {
      // Arrange
      prismaMock.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.list();

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("deve retornar uma lista mapeada de usuários", async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          birthdate: mockUser.birthdate,
          avatarUrl: mockUser.avatarUrl,
          role: mockUser.role,
          password: mockUser.password,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        {
          id: "user-id-2",
          name: "Jane Doe",
          email: "jane@example.com",
          phone: mockUser.phone,
          birthdate: mockUser.birthdate,
          avatarUrl: mockUser.avatarUrl,
          role: "ADMINISTRADOR" as UserRole,
          password: mockUser.password,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ];
      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await repository.list();

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);

      // Verificar campos do usuário mapeado
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockUsers[0].id,
          name: mockUsers[0].name,
          email: mockUsers[0].email,
          phone: mockUsers[0].phone,
          birthdate: mockUsers[0].birthdate,
          avatarUrl: mockUsers[0].avatarUrl,
          role: mockUsers[0].role,
          createdAt: mockUsers[0].createdAt,
          updatedAt: mockUsers[0].updatedAt,
        }),
      );
      expect(result[0]).not.toHaveProperty("password");
      expect(result[1]).not.toHaveProperty("password");

      // A senha não deve estar presente nos objetos mapeados
      result.forEach((user) => {
        expect(user).not.toHaveProperty("password");
      });
    });
  });
});
