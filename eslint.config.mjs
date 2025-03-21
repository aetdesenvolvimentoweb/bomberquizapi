import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Configuração base para todos os arquivos
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },

  // Configuração específica para JavaScript
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },

  // Configurações TypeScript (usando os presets recomendados)
  ...tseslint.configs.recommended,

  // Regras personalizadas para TypeScript
  {
    files: ["**/*.ts"],
    rules: {
      // Adicione regras personalizadas aqui, por exemplo:
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Ignorar arquivos de configuração e construção
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
]);
