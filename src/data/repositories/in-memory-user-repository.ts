/**
 * Implementação em memória do repositório de usuários para testes
 *
 * Esta classe implementa a interface UserRepository utilizando um array em memória
 * para armazenar os dados, sem dependência de bancos de dados externos. É projetada
 * principalmente para ser utilizada em testes unitários e de integração, permitindo:
 *
 * - Testes rápidos sem necessidade de configuração de banco de dados
 * - Isolamento completo entre execuções de testes
 * - Comportamento determinístico e previsível
 * - Verificação fácil do estado interno do repositório
 *
 * @implements {UserRepository}
 *
 * @example
 * // Uso em testes unitários
 * describe('UserService', () => {
 *   let userRepository: UserRepository;
 *
 *   beforeEach(() => {
 *     // Cria uma nova instância limpa para cada teste
 *     userRepository = new InMemoryUserRepository();
 *   });
 *
 *   it('deve criar um usuário corretamente', async () => {
 *     const userData = { name: 'Test User', email: 'test@example.com', ... };
 *     await userRepository.create(userData);
 *
 *     const user = await userRepository.findByEmail('test@example.com');
 *     expect(user).not.toBeNull();
 *     expect(user?.name).toBe('Test User');
 *   });
 * });
 */
import {
  User,
  USER_DEFAULT_AVATAR_URL,
  USER_DEFAULT_ROLE,
  UserCreateData,
  UserMapped,
} from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

/**
 * Repositório de usuários em memória para testes
 */
export class InMemoryUserRepository implements UserRepository {
  /**
   * Array que armazena os usuários em memória
   * @private
   */
  private users: User[] = [];

  /**
   * Cria um novo usuário no repositório
   *
   * @param {UserCreateData} data - Dados do usuário a ser criado
   * @returns {Promise<void>} - Promise que resolve quando o usuário é criado
   */
  public readonly create = async (data: UserCreateData): Promise<void> => {
    this.users.push({
      ...data,
      id: crypto.randomUUID(),
      avatarUrl: USER_DEFAULT_AVATAR_URL,
      role: USER_DEFAULT_ROLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  /**
   * Busca um usuário pelo endereço de e-mail
   *
   * @param {string} email - E-mail do usuário a ser encontrado
   * @returns {Promise<User | null>} - Promise que resolve para o usuário encontrado ou null
   */
  public readonly findByEmail = async (email: string): Promise<User | null> => {
    return this.users.find((user) => user.email === email) || null;
  };

  /**
   * Lista todos os usuários do sistema
   *
   * @returns {Promise<User[]>} - Promise que resolve para um array de usuários
   */
  public readonly list = async (): Promise<UserMapped[]> => {
    return this.users.map((user) => this.mapUser(user));
  };

  private mapUser(user: User): UserMapped {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
