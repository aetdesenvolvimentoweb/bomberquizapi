/**
 * Utilitários de resposta HTTP
 *
 * Este arquivo contém funções auxiliares para criar respostas HTTP padronizadas
 * utilizadas pelos controladores da aplicação. Estas funções garantem um formato
 * consistente de respostas em toda a API.
 *
 * @module HttpResponses
 */

import { ApplicationError } from "@/domain/errors";

import { HttpResponse } from "../protocols";

/**
 * Cria uma resposta HTTP com status 201 (Created)
 *
 * Utilizada para indicar que um recurso foi criado com sucesso.
 *
 * @returns {HttpResponse} Objeto de resposta HTTP formatado
 *
 * @example
 * // Em um controlador após criar um usuário:
 * return created();
 * // Resultado:
 * // { body: { success: true, metadata: { timestamp: "2023-01-01T00:00:00.000Z" } }, statusCode: 201 }
 */
export const created = (): HttpResponse => {
  return {
    body: {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    statusCode: 201,
  };
};

/**
 * Cria uma resposta HTTP de erro com status 500 (Internal Server Error)
 *
 * Utilizada para indicar erros internos do servidor que não foram tratados
 * por handlers específicos.
 *
 * @param {unknown} error - O objeto de erro que causou a falha
 * @returns {HttpResponse} Objeto de resposta HTTP formatado com detalhes do erro
 *
 * @example
 * // Em um controlador, capturando uma exceção:
 * try {
 *   // Alguma operação
 * } catch (error) {
 *   return serverError(error);
 * }
 * // Resultado para error = new Error("Falha no banco de dados"):
 * // {
 * //   body: {
 * //     success: false,
 * //     errorMessage: "Falha no banco de dados",
 * //     metadata: { timestamp: "2023-01-01T00:00:00.000Z" }
 * //   },
 * //   statusCode: 500
 * // }
 */
export const serverError = (error: unknown): HttpResponse => {
  return {
    body: {
      success: false,
      errorMessage: (error as Error).message,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    statusCode: 500,
  };
};

/**
 * Processa um erro e retorna uma resposta HTTP apropriada
 *
 * Esta função determina automaticamente o tipo de resposta de erro baseada no tipo do erro:
 * - Para erros do tipo ApplicationError, utiliza o código de status do erro
 * - Para outros tipos de erro, utiliza serverError (status 500)
 *
 * @param {unknown} error - O objeto de erro a ser processado
 * @returns {HttpResponse} Objeto de resposta HTTP formatado de acordo com o tipo de erro
 *
 * @example
 * // Em um controlador, com um ApplicationError:
 * try {
 *   // Operação que pode lançar diferentes tipos de erro
 * } catch (error) {
 *   return handleError(error);
 * }
 * // Resultado para erro específico da aplicação (código 422):
 * // {
 * //   body: {
 * //     success: false,
 * //     errorMessage: "Dados inválidos",
 * //     metadata: { timestamp: "2023-01-01T00:00:00.000Z" }
 * //   },
 * //   statusCode: 422
 * // }
 */
export const handleError = (error: unknown): HttpResponse => {
  if (error instanceof ApplicationError) {
    return {
      body: {
        success: false,
        errorMessage: error.message,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: error.statusCode,
    };
  }

  // Se o erro não for ApplicationError, criar um ServerError
  return serverError(error);
};

/**
 * Cria uma resposta HTTP de sucesso com status 200 (OK)
 *
 * Utilizada para retornar dados em operações bem-sucedidas.
 *
 * @template T - Tipo dos dados a serem retornados
 * @param {T} data - Dados a serem incluídos na resposta
 * @returns {HttpResponse<T>} Objeto de resposta HTTP formatado incluindo os dados
 *
 * @example
 * // Em um controlador, retornando dados de usuário:
 * const user = { id: 1, name: "John Doe" };
 * return ok(user);
 * // Resultado:
 * // {
 * //   body: {
 * //     success: true,
 * //     data: { id: 1, name: "John Doe" },
 * //     metadata: { timestamp: "2023-01-01T00:00:00.000Z" }
 * //   },
 * //   statusCode: 200
 * // }
 */
export const ok = <T>(data: T): HttpResponse<T> => {
  return {
    body: {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    statusCode: 200,
  };
};
