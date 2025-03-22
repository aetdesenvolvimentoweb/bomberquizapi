/**
 * Adaptador para o Prisma Client com padrão Singleton
 *
 * Este módulo implementa o padrão Singleton para o Prisma Client, garantindo que
 * apenas uma única instância seja criada e reutilizada em toda a aplicação,
 * particularmente em ambientes de desenvolvimento.
 *
 * @module infra/adapters/prisma-client-adapter
 *
 * @description
 * O Prisma recomenda que apenas uma única instância do PrismaClient seja criada
 * e reutilizada em toda a aplicação para evitar:
 *
 * - Excesso de conexões com o banco de dados
 * - Vazamento de memória em ambientes de desenvolvimento com hot-reload
 * - Problemas de performance com múltiplas conexões
 *
 * Este adaptador guarda a instância do Prisma Client no objeto global do Node.js
 * em ambientes de desenvolvimento, permitindo que a mesma instância seja reutilizada
 * mesmo quando o código é recarregado durante o desenvolvimento.
 *
 * Em ambientes de produção (NODE_ENV=production), uma nova instância é criada
 * a cada inicialização da aplicação, seguindo o comportamento padrão recomendado.
 *
 * @example
 * // Importar e usar o cliente Prisma em seus repositórios
 * import { prismaClient } from '@/infra/adapters/prisma-client-adapter';
 *
 * export class PrismaUserRepository implements UserRepository {
 *   async findByEmail(email: string): Promise<User | null> {
 *     const user = await prismaClient.user.findUnique({
 *       where: { email }
 *     });
 *     return user ? this.mapToDomain(user) : null;
 *   }
 * }
 */

import { PrismaClient } from "@prisma/client";

/**
 * Extensão do objeto global para armazenar a instância do PrismaClient
 * @type {Object & { prismaClient: PrismaClient }}
 */
const globalPrisma = global as unknown as { prismaClient: PrismaClient };

/**
 * Instância única do PrismaClient
 * Reutiliza uma instância existente ou cria uma nova
 * @const {PrismaClient}
 */
const prismaClient = globalPrisma.prismaClient || new PrismaClient();

/**
 * Armazena a instância no objeto global em ambientes de desenvolvimento
 * para permitir reutilização entre recargas de código (hot reloads)
 */
if (process.env.NODE_ENV !== "production") {
  globalPrisma.prismaClient = prismaClient;
}

/**
 * Exporta a instância singleton do PrismaClient
 * @exports prismaClient
 */
export { prismaClient };
