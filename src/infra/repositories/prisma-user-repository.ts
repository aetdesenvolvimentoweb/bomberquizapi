/**
 * Implementação do repositório de usuários usando Prisma ORM
 *
 * Este módulo implementa a interface UserRepository utilizando o Prisma ORM
 * para persistência de dados. Ele é responsável pela comunicação com o banco
 * de dados para operações relacionadas a usuários, como criação, consulta e
 * listagem.
 *
 * @module infra/repositories/prisma-user-repository
 *
 * @description
 * A classe PrismaUserRepository encapsula todas as operações de acesso a dados
 * relacionadas a usuários, utilizando o cliente Prisma para interagir com o
 * banco de dados. Ela implementa a interface UserRepository definida na camada
 * de domínio, fornecendo uma implementação concreta das operações necessárias.
 *
 * Esta implementação:
 * - Utiliza o adaptador singleton do Prisma Client para evitar múltiplas conexões
 * - Faz o mapeamento adequado entre os tipos do Prisma e os tipos de domínio
 * - Implementa operações de CRUD específicas para usuários
 *
 * @example
 * // Instanciar e utilizar o repositório
 * const userRepository = new PrismaUserRepository();
 *
 * // Criar um novo usuário
 * await userRepository.create({
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 *   phone: '+5511999999999',
 *   birthdate: new Date('1990-01-01'),
 *   password: 'secure_password'
 * });
 *
 * // Buscar um usuário pelo email
 * const user = await userRepository.findByEmail('john.doe@example.com');
 *
 * // Listar todos os usuários
 * const users = await userRepository.list();
 */

import { User, UserCreateData, UserMapped, UserRole } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

import { prismaClient } from "../adapters/prisma-client-adapter";

/**
 * Implementação do repositório de usuários com Prisma ORM
 * @implements {UserRepository}
 */
export class PrismaUserRepository implements UserRepository {
  /**
   * Mapeia um usuário do formato do Prisma para o formato de domínio
   *
   * @private
   * @param {User} user - Usuário no formato retornado pelo Prisma
   * @returns {UserMapped} Usuário mapeado para o formato de domínio
   */
  private userMap = (user: User): UserMapped => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      avatarUrl: user.avatarUrl,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  /**
   * Cria um novo usuário no banco de dados
   *
   * @param {UserCreateData} data - Dados do usuário a ser criado
   * @returns {Promise<void>} Promise que resolve quando o usuário for criado
   *
   * @example
   * await userRepository.create({
   *   name: 'Jane Doe',
   *   email: 'jane.doe@example.com',
   *   phone: '+5511988888888',
   *   birthdate: new Date('1992-05-15'),
   *   password: 'secure_password'
   * });
   */
  public readonly create = async (data: UserCreateData): Promise<void> => {
    await prismaClient.user.create({
      data,
    });
  };

  /**
   * Busca um usuário pelo endereço de email
   *
   * @param {string} email - Email do usuário a ser encontrado
   * @returns {Promise<User | null>} Promise que resolve para o usuário encontrado ou null
   *
   * @example
   * const user = await userRepository.findByEmail('user@example.com');
   * if (user) {
   *   console.log(`Usuário encontrado: ${user.name}`);
   * } else {
   *   console.log('Usuário não encontrado');
   * }
   */
  public readonly findByEmail = async (email: string): Promise<User | null> => {
    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return { ...user, role: user.role as UserRole };
    }

    return null;
  };

  /**
   * Lista todos os usuários do sistema
   *
   * @returns {Promise<UserMapped[]>} Promise que resolve para um array de usuários mapeados
   *
   * @example
   * const users = await userRepository.list();
   * console.log(`Total de usuários: ${users.length}`);
   * users.forEach(user => console.log(`- ${user.name} (${user.email})`));
   */
  public readonly list = async (): Promise<UserMapped[]> => {
    const users = await prismaClient.user.findMany();

    return users.map((user) =>
      this.userMap({ ...user, role: user.role as UserRole }),
    );
  };
}
