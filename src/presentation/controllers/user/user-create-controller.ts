/**
 * Controlador para criação de usuários
 *
 * Este módulo implementa o controlador responsável por processar requisições HTTP
 * para criação de novos usuários. Ele recebe os dados do usuário, delega o
 * processamento para o serviço apropriado e retorna uma resposta padronizada.
 *
 * @module presentation/controllers/user/user-create-controller
 *
 */

import { UserCreateService } from "@/data/services";
import { UserCreateData } from "@/domain/entities";
import { MissingParamError } from "@/domain/errors";
import { created, handleError } from "@/presentation/helpers";
import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@/presentation/protocols";

/**
 * Interface que define as dependências necessárias para o controlador
 *
 * @interface UserCreateControllerProps
 */
interface UserCreateControllerProps {
  /** Serviço responsável pela lógica de criação de usuários */
  userCreateService: UserCreateService;
}

/**
 * Implementação do controlador para criação de usuários
 *
 * Este controlador segue o padrão de inversão de dependência,
 * recebendo suas dependências através do construtor, o que facilita
 * testes e manutenção.
 *
 * @class UserCreateController
 * @implements {Controller<UserCreateData>}
 */
export class UserCreateController implements Controller<UserCreateData> {
  /**
   * Cria uma nova instância do controlador
   *
   * @param {UserCreateControllerProps} props - Dependências do controlador
   */
  constructor(private readonly props: UserCreateControllerProps) {}

  /**
   * Processa uma requisição para criação de usuário
   *
   * Este método:
   * 1. Valida a presença do corpo da requisição
   * 2. Delega a criação do usuário para o serviço especializado
   * 3. Retorna uma resposta HTTP padronizada
   * 4. Trata qualquer erro que ocorra durante o processo
   *
   * @param {HttpRequest<UserCreateData>} request - Requisição HTTP com dados do usuário
   * @returns {Promise<HttpResponse>} Resposta HTTP padronizada
   */
  public readonly handle = async (
    request: HttpRequest<UserCreateData>,
  ): Promise<HttpResponse> => {
    const { userCreateService } = this.props;

    try {
      if (!request.body) {
        throw new MissingParamError("corpo da requisição não informado");
      }

      await userCreateService.create({
        ...request.body,
        birthdate: new Date(request.body.birthdate),
      } as UserCreateData);

      return created();
    } catch (error: unknown) {
      // Melhorar a verificação de tipos de erro
      return handleError(error);
    }
  };
}
