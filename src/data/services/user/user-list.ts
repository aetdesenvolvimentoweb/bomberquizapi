import { UserMapped } from "@/domain/entities";
import { ServerError } from "@/domain/errors";
import { LoggerProvider } from "@/domain/providers";
import { UserRepository } from "@/domain/repositories";
import { UserListUseCase } from "@/domain/usecases";

/**
 * Propriedades necessárias para a criação do serviço de listagem de usuários
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
 *
 * Esta classe implementa o caso de uso UserListUseCase, oferecendo
 * funcionalidade para listar todos os usuários do sistema com logs
 * apropriados de execução e tratamento de erros.
 *
 * @implements {UserListUseCase}
 *
 * @example
 * const userListService = new UserListService({
 *   userRepository: new PrismaUserRepository(),
 *   loggerProvider: new WinstonLoggerProvider(),
 * });
 *
 * // Listar todos os usuários
 * const users = await userListService.list();
 * console.log(`Encontrados ${users.length} usuários`);
 */
export class UserListService implements UserListUseCase {
  /**
   * Cria uma nova instância do serviço de listagem de usuários
   *
   * @param {UserListServiceProps} props - Dependências necessárias para o serviço
   */
  constructor(private readonly props: UserListServiceProps) {}

  /**
   * Lista todos os usuários do sistema
   *
   * @returns {Promise<UserMapped[]>} Promise que resolve com um array de usuários mapeados
   * O array pode estar vazio se não houver usuários cadastrados no sistema.
   *
   * @throws {ServerError} Se ocorrer um erro durante a listagem dos usuários
   */
  public readonly list = async (): Promise<UserMapped[]> => {
    const { loggerProvider, userRepository } = this.props;

    try {
      loggerProvider.info("Iniciando listagem de usuários");

      const users = await userRepository.list();

      loggerProvider.info(
        `Listagem de usuários concluída com sucesso. Total: ${users.length} usuários encontrados`,
      );

      return users;
    } catch (error) {
      loggerProvider.error(
        `Erro ao listar usuários: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );

      const serverError = new Error(
        `Erro inesperado do servidor. ${(error as Error).message}`,
      );

      throw new ServerError(serverError);
    }
  };
}
