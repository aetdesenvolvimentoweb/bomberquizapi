import { UserMapped } from "@/domain/entities";

/**
 * Interface que define o caso de uso para listar usuários do sistema.
 * Esta interface faz parte da camada de domínio e define o contrato para
 * implementações concretas que buscarão usuários do sistema.
 */
export interface UserListUseCase {
  /**
   * Lista todos os usuários cadastrados no sistema.
   *
   * @description Este método é responsável por recuperar todos os usuários
   * registrados no sistema, retornando suas informações no formato mapeado.
   *
   * @returns {Promise<UserMapped[]>} Promise que resolve com um array de usuários mapeados.
   * O array pode estar vazio se não houver usuários cadastrados.
   *
   * @throws {ServerError} Se ocorrer um erro interno durante a busca ou processamento dos dados.
   * @throws {DatabaseError} Se ocorrer um erro na conexão com o banco de dados.
   * @throws {AuthorizationError} Se o usuário que faz a requisição não tiver permissão adequada.
   */
  list: () => Promise<UserMapped[]>;
}
