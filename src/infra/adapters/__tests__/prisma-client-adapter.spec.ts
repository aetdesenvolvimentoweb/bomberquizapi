/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Testes unitários para o adaptador do Prisma Client
 */

// Primeiro mockamos o PrismaClient **antes** de qualquer importação
const mockPrismaClientConstructor = jest.fn();
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: mockPrismaClientConstructor.mockImplementation(() => {
      return {
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe("PrismaClientAdapter", () => {
  // Salvar o NODE_ENV original
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Limpar os mocks e caches para cada teste
    jest.resetModules();
    mockPrismaClientConstructor.mockClear();

    // Limpar o objeto global
    if ("prismaClient" in (global as any)) {
      delete (global as any).prismaClient;
    }
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("deve criar uma nova instância do PrismaClient quando importado pela primeira vez", async () => {
    // Definir ambiente
    process.env.NODE_ENV = "development";

    // Importar o módulo usando importação dinâmica ES6
    const module = await import("../prisma-client-adapter");
    const { prismaClient } = module;

    // Verificar que o construtor foi chamado
    expect(mockPrismaClientConstructor).toHaveBeenCalledTimes(1);
    expect(prismaClient).toBeDefined();
  });

  it("deve reutilizar a instância existente do PrismaClient em ambiente de desenvolvimento", async () => {
    // Definir ambiente
    process.env.NODE_ENV = "development";

    // Primeira importação
    const firstModule = await import("../prisma-client-adapter");
    const firstInstance = firstModule.prismaClient;

    // Limpar o contador de chamadas
    mockPrismaClientConstructor.mockClear();

    // Segunda importação - não deve chamar o construtor novamente
    const secondModule = await import("../prisma-client-adapter");
    const secondInstance = secondModule.prismaClient;

    // O construtor não deve ser chamado novamente
    expect(mockPrismaClientConstructor).toHaveBeenCalledTimes(0);

    // Verificar que a instância foi reutilizada
    expect(firstInstance).toBe(secondInstance);
    expect((global as any).prismaClient).toBeDefined();
  });

  it("deve criar uma nova instância do PrismaClient em ambiente de produção", async () => {
    // Configurar para ambiente de produção
    process.env.NODE_ENV = "production";

    // Limpar o objeto global para simular um novo ambiente
    delete (global as any).prismaClient;

    // Importar o módulo
    const module = await import("../prisma-client-adapter");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prismaClient } = module;

    // O construtor deve ser chamado
    expect(mockPrismaClientConstructor).toHaveBeenCalledTimes(1);

    // A instância global não deve existir em produção
    expect((global as any).prismaClient).toBeUndefined();
  });

  it("deve armazenar a instância no objeto global apenas em ambiente de desenvolvimento", async () => {
    // Configurar para ambiente de desenvolvimento
    process.env.NODE_ENV = "development";

    // Limpar qualquer instância anterior
    delete (global as any).prismaClient;

    // Importar o módulo
    const module = await import("../prisma-client-adapter");
    const { prismaClient } = module;

    // Verificar se a instância está no objeto global
    expect((global as any).prismaClient).toBeDefined();
    expect((global as any).prismaClient).toBe(prismaClient);
  });
});
