// src/main/adapters/__tests__/fastify-route-adapter.spec.ts
import { FastifyReply, FastifyRequest } from "fastify";

import { Controller } from "@/presentation/protocols";

import { fastifyRouteAdapter } from "../fastify-route-adapter";

describe("Fastify Route Adapter", () => {
  let mockController: Controller;
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adaptedRoute: any;

  beforeEach(() => {
    // Criar mock do controller
    mockController = {
      handle: jest.fn(),
    };

    // Criar mock do request do Fastify
    mockRequest = {
      body: { name: "Test User" },
      params: { id: "123" },
      query: { page: "1" },
      headers: { "content-type": "application/json" },
    } as unknown as FastifyRequest;

    // Criar mock do reply do Fastify
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    // Criar a rota adaptada
    adaptedRoute = fastifyRouteAdapter(mockController);
  });

  it("deve retornar uma função de handler", () => {
    expect(typeof adaptedRoute).toBe("function");
  });

  it("deve chamar controller.handle com o request correto", async () => {
    // Configurar o retorno do controller
    const httpResponse = {
      statusCode: 200,
      body: { id: 1, name: "Test User" },
    };
    (mockController.handle as jest.Mock).mockResolvedValue(httpResponse);

    // Executar o handler adaptado
    await adaptedRoute(mockRequest, mockReply);

    // Verificar se o controller foi chamado com o objeto de request correto
    expect(mockController.handle).toHaveBeenCalledWith({
      body: mockRequest.body,
      params: mockRequest.params,
      query: mockRequest.query,
      headers: mockRequest.headers,
    });
  });

  it("deve retornar o status e body corretos em caso de sucesso", async () => {
    // Configurar o retorno do controller
    const httpResponse = {
      statusCode: 201,
      body: { id: 1, name: "Test User" },
    };
    (mockController.handle as jest.Mock).mockResolvedValue(httpResponse);

    // Executar o handler adaptado
    await adaptedRoute(mockRequest, mockReply);

    // Verificar se reply.code e reply.send foram chamados com os valores corretos
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({ id: 1, name: "Test User" });
  });

  it("deve retornar o status e body de erro em caso de falha", async () => {
    // Configurar o retorno do controller com um erro
    const errorResponse = { statusCode: 400, body: { error: "Bad Request" } };
    (mockController.handle as jest.Mock).mockResolvedValue(errorResponse);

    // Executar o handler adaptado
    await adaptedRoute(mockRequest, mockReply);

    // Verificar se reply.code e reply.send foram chamados com os valores corretos
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: "Bad Request" });
  });

  it("deve tratar erros lançados pelo controller", async () => {
    // Configurar o controller para lançar um erro
    const error = new Error("Internal error");
    (mockController.handle as jest.Mock).mockRejectedValue(error);

    // Executar o handler adaptado com try/catch para capturar o erro
    try {
      await adaptedRoute(mockRequest, mockReply);
    } catch (e) {
      expect(e).toBe(error);
    }

    // Verificar se o controller foi chamado
    expect(mockController.handle).toHaveBeenCalled();
  });

  it("deve passar todos os campos relevantes do request para o controller", async () => {
    // Configurar retorno do controller
    (mockController.handle as jest.Mock).mockResolvedValue({
      statusCode: 200,
      body: {},
    });

    // Criar request com todos os campos preenchidos
    const fullRequest = {
      body: { key: "value" },
      params: { id: "123" },
      query: { filter: "active" },
      headers: { authorization: "Bearer token" },
    } as unknown as FastifyRequest;

    // Executar o handler adaptado
    await adaptedRoute(fullRequest, mockReply);

    // Verificar se todos os campos foram passados corretamente
    expect(mockController.handle).toHaveBeenCalledWith({
      body: { key: "value" },
      params: { id: "123" },
      query: { filter: "active" },
      headers: { authorization: "Bearer token" },
    });
  });
});
