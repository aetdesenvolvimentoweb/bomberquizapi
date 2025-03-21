import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
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

  // Configuração do plugin simple-import-sort
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Desabilitar regras de sort do ESLint que possam conflitar
      "sort-imports": "off",
      "import/order": "off",
    },
  },

  // Integração com Prettier
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  // Desabilitar regras do ESLint que podem conflitar com o Prettier
  prettierConfig,

  // Ignorar arquivos de configuração e construção
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
]);
