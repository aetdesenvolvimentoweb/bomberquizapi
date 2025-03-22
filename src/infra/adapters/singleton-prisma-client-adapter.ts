import { PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

// Importar o prismaClient diretamente para mockear
import { prismaClient } from "@/infra/adapters";

// Mock do módulo correto que contém o prismaClient
jest.mock("./prisma-client-adapter", () => ({
  prismaClient: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock =
  prismaClient as unknown as DeepMockProxy<PrismaClient>;
