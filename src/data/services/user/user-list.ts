import { UserMapped } from "@/domain/entities";
import { LoggerProvider } from "@/domain/providers";
import { UserRepository } from "@/domain/repositories";
import { UserListUseCase } from "@/domain/usecases";

/**
 * Propriedades necessárias para a criação do serviço
 *
 * @interface UserListServiceProps
 */
interface UserListServiceProps {
  /** Repositório para persistência de usuários */
  userRepository: UserRepository;
  /** Provedor de logs para registro de eventos e erros */
  loggerProvider: LoggerProvider;
}

/**
 * Implementação do serviço de listagem de usuários
 */

export class UserListService implements UserListUseCase {
  constructor(private readonly props: UserListServiceProps) {}

  /**
   * Lista todos os usuários do sistema
   *
   * @returns {Promise<User[]>} Promise que resolve com um array de usuários
   *
   * @throws {ServerError} Se ocorrer um erro durante a listagem
   */
  public readonly list = async (): Promise<UserMapped[]> => {
    this.props.loggerProvider.info("Listing users...");
    const users = await this.props.userRepository.list();
    this.props.loggerProvider.info("Users listed successfully!");
    return users;
  };
}
