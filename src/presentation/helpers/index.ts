/**
 * Exportações de utilitários de apresentação
 *
 * Este arquivo de barril (barrel file) serve como ponto de entrada central
 * para todos os utilitários relacionados à camada de apresentação, facilitando
 * importações mais limpas em outros módulos da aplicação.
 *
 * Ele re-exporta:
 * - Utilitários de resposta HTTP padronizadas como created(), ok(), serverError(), handleError()
 *
 * @module PresentationHelpers
 *
 * @example
 * // Ao invés de importar de cada arquivo individualmente:
 * import { ok } from "@/presentation/helpers/http-responses";
 *
 * // Importe de forma mais limpa através deste arquivo de barril:
 * import { ok } from "@/presentation/helpers";
 *
 * // O que permite importações mais organizadas quando precisar de múltiplas funções:
 * import { ok, created, handleError } from "@/presentation/helpers";
 */

export * from "./http-responses";
