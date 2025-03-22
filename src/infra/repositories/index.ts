/**
 * @fileoverview Arquivo de barrel export para os repositórios da aplicação.
 * Este arquivo facilita a importação dos repositórios em outros módulos,
 * centralizando todas as exportações em um único ponto de entrada.
 *
 * @module infra/repositories
 */

/**
 * Re-exporta todas as entidades e funções do repositório Prisma de usuários.
 * Isso inclui classes, interfaces e implementações relacionadas ao acesso
 * e manipulação de dados de usuários no banco de dados.
 */
export * from "./prisma-user-repository";
