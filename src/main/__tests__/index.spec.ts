// src/__tests__/index.spec.ts
import { main } from "../main/index";
import { startServer } from "../main/server";

// Mock das dependências
jest.mock("../main/server", () => ({
  startServer: jest.fn().mockResolvedValue(undefined),
}));

// Mock de module-alias/register
jest.mock("module-alias/register", () => {
  // Apenas mock vazio
});

describe("Application Entry Point", () => {
  // Guardar o environment original
  const originalEnv = { ...process.env };
  // Guardar console.error original
  const originalConsoleError = console.error;
  // Mock do console.error
  let consoleErrorMock: jest.Mock;

  beforeEach(() => {
    // Restaurar o ambiente original antes de cada teste
    process.env = { ...originalEnv };
    // Limpar todos os mocks
    jest.clearAllMocks();
    // Criar mock para console.error
    consoleErrorMock = jest.fn();
    console.error = consoleErrorMock;
  });

  afterEach(() => {
    // Restaurar console.error
    console.error = originalConsoleError;
  });

  afterAll(() => {
    // Restaurar o ambiente original
    process.env = originalEnv;
  });

  it("deve iniciar o servidor com a porta padrão 3000 quando PORT não está definido", async () => {
    // Remover PORT
    delete process.env.PORT;

    // Executar a função main
    await main();

    // Verificar se startServer foi chamado com 3000
    expect(startServer).toHaveBeenCalledWith(3000);
  });

  it("deve iniciar o servidor com a porta da variável PORT quando definida", async () => {
    // Definir PORT
    process.env.PORT = "4000";

    // Executar a função main
    await main();

    // Verificar se startServer foi chamado com 4000
    expect(startServer).toHaveBeenCalledWith(4000);
  });

  it("deve tratar erros do startServer adequadamente", async () => {
    // Configurar startServer para lançar um erro
    const testError = new Error("Falha ao iniciar o servidor");
    (startServer as jest.Mock).mockRejectedValueOnce(testError);

    // Executar a função main
    await main();

    // Verificar se console.error foi chamado com o erro
    expect(consoleErrorMock).toHaveBeenCalledWith(testError);
  });

  it("deve converter PORT para número mesmo quando é uma string", async () => {
    // Definir PORT como string
    process.env.PORT = "5000";

    // Executar a função main
    await main();

    // Verificar se a conversão foi feita corretamente
    expect(startServer).toHaveBeenCalledWith(5000);
    expect(startServer).not.toHaveBeenCalledWith("5000");
  });
});
