/**
 * Configuração do Jest
 *
 * Convenções de nomenclatura de testes:
 * - *.spec.ts: Testes unitários que utilizam mocks para isolar a unidade testada
 * - *.test.ts: Testes de integração que utilizam implementações reais de dependências
 */
import type { Config } from "jest";

const config: Config = {
  roots: ["<rootDir>/src"],
  cache: false,
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!**/node_modules/**",
    "!<rootDir>/src/**/tests/**",
    "!<rootDir>/src/**/__tests__/**",
    "!<rootDir>/src/**/*.test.ts",
    "!<rootDir>/src/**/*.spec.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  coverageReporters: ["json", "lcov", "text", "clover", "json-summary"],
  maxWorkers: 1,
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  passWithNoTests: true,
  preset: "ts-jest",
  resetMocks: true,
  silent: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: "es2021",
        },
      },
    ],
  },
};

export default config;
