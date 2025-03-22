// src/index.ts
// Registrar aliases primeiro, antes de qualquer importação
import "./register-aliases";

// Depois importar os outros módulos
import { startServer } from "./server";

// Função principal para iniciar o servidor
export async function main(): Promise<void> {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  try {
    await startServer(PORT);
  } catch (error) {
    console.error(error);
  }
}

// Executar a função principal apenas se este arquivo for executado diretamente
/* istanbul ignore next */
if (require.main === module) {
  main();
}
