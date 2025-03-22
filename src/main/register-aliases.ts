// src/register-aliases.ts
import moduleAlias from "module-alias";
import * as path from "path";

// Configuramos aliases com base no ambiente
const baseFolder = process.env.NODE_ENV === "production" ? "dist" : "src";

// Adiciona o alias @ para apontar para a pasta correta
moduleAlias.addAliases({
  "@": path.join(process.cwd(), baseFolder),
});

console.log(`[Module Alias] Aliases configurados: @ => ${baseFolder}`);
