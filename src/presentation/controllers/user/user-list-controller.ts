/**
 * Controlador para listagem de usuários
 *
 * Este módulo implementa o controlador responsável por processar requisições HTTP
 * para listagem de usuários. Ele recebe os dados do usuário, delega o
 * processamento para o serviço apropriado e retorna uma resposta padronizada.
 *
 * @module presentation/controllers/user/user-list-controller
 *
 */

import { UserListService } from "@/data/services";
import { UserMapped } from "@/domain/entities";
import { LoggerProvider } from "@/domain/providers";
import { handleError, ok } from "@/presentation/helpers";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@/presentation/protocols";

/**
 * Interface que define as dependências necessárias para o controlador
 *
 * @interface UserListControllerProps
 */
interface UserListControllerProps {
  /** Serviço responsável pela lógica de listagem de usuários */
  userListService: UserListService;
  /** Provedor de logs para registro de eventos e erros */
  loggerProvider: LoggerProvider;
}

/**
 * Implementação do controlador para listagem de usuários
 *
 * Este controlador segue o padrão de inversão de dependência,
 * recebendo suas dependências através do construtor, o que facilita
 * testes e manutenção.
 *
 * @class UserListController
 * @implements {Controller}
 */
export class UserListController implements Controller {
  constructor(private readonly props: UserListControllerProps) {}

  /**
   * Processa uma requisição HTTP para listagem de usuários
   *
   * @param {HttpRequest} request - Requisição HTTP recebida
   * @returns {Promise<HttpResponse>} Resposta HTTP padronizada
   */
  public readonly handle = async (
    _request: HttpRequest,
  ): Promise<HttpResponse<UserMapped[]>> => {
    try {
      this.props.loggerProvider.info("Listing users...");
      const users = await this.props.userListService.list();
      this.props.loggerProvider.info("Users listed successfully!");
      return ok<UserMapped[]>(users);
    } catch (error) {
      return handleError(error);
    }
  };
}
