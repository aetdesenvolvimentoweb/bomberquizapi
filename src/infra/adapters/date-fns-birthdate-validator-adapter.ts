import { differenceInYears, isPast, isValid } from "date-fns";

import { InvalidParamError, ServerError } from "@/domain/errors";
import { UserBirthdateValidatorUseCase } from "@/domain/validators";

/**
 * Implementação concreta do validador de data de nascimento usando date-fns
 *
 * Esta classe implementa a lógica de validação de datas de nascimento,
 * verificando se a idade está dentro dos limites permitidos (18-65 anos)
 * e se a data não está no futuro.
 *
 * @implements {UserBirthdateValidatorUseCase}
 */
export class DateFnsBirthdateValidatorAdapter
  implements UserBirthdateValidatorUseCase
{
  /**
   * Idade mínima permitida em anos
   */
  private readonly MIN_AGE_YEARS: number = 18;

  /**
   * Idade máxima permitida em anos
   */
  private readonly MAX_AGE_YEARS: number = 70;

  /**
   * Valida uma data de nascimento
   *
   * @param {Date} birthdate - Data de nascimento a ser validada
   * @returns {void} Não retorna valor, mas lança exceção se a data for inválida
   * @throws {InvalidParamError} Quando a data de nascimento não atende aos critérios de validação
   */
  validate(birthdate: Date): void {
    try {
      // Verifica se a data é válida
      if (!birthdate || !isValid(birthdate)) {
        throw new InvalidParamError("data de nascimento", "data inválida");
      }

      const today = new Date();

      // Verifica se a data está no futuro
      if (!isPast(birthdate)) {
        throw new InvalidParamError(
          "data de nascimento",
          "não pode ser no futuro",
        );
      }

      // Calcula a idade usando date-fns
      const age = differenceInYears(today, birthdate);

      // Verifica idade mínima
      if (age < this.MIN_AGE_YEARS) {
        throw new InvalidParamError(
          "data de nascimento",
          `usuário deve ter pelo menos ${this.MIN_AGE_YEARS} anos`,
        );
      }

      // Verifica idade máxima
      if (age > this.MAX_AGE_YEARS) {
        throw new InvalidParamError(
          "data de nascimento",
          `idade excede o limite máximo de ${this.MAX_AGE_YEARS} anos`,
        );
      }
    } catch (error) {
      // Se o erro já é um ServerError ou um InvalidParamError, propaga
      if (error instanceof ServerError || error instanceof InvalidParamError) {
        throw error;
      }

      // Para outros erros da biblioteca, converte para ServerError
      throw new ServerError(error as Error);
    }
  }
}
