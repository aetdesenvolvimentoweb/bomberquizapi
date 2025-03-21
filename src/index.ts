// src/index.ts
import "module-alias/register";

import { startServer } from "./main/server";

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
// Isso permite testar a lógica sem iniciar o servidor
/* istanbul ignore next */
if (require.main === module) {
  main();
}
