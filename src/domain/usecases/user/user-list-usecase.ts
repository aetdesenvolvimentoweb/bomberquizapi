import { UserMapped } from "@/domain/entities";

export interface UserListUseCase {
  /**
   * Lista todos os usuários do sistema
   *
   * @returns {Promise<User[]>} Promise que resolve com um array de usuários
   *
   * @throws {ServerError} Se ocorrer um erro durante a listagem
   */
  list: () => Promise<UserMapped[]>;
}
