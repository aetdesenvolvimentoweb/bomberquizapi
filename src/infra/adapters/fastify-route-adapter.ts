// src/main/adapters/fastify-route-adapter.ts
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";

import { Controller } from "@/presentation/protocols";

export const fastiftRouteAdapter = (
  controller: Controller,
): RouteHandlerMethod => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const httpRequest = {
      body: request.body,
      params: request.params,
      query: request.query,
      headers: request.headers,
    };

    const httpResponse = await controller.handle(httpRequest);

    return reply.code(httpResponse.statusCode).send(httpResponse.body);
  };
};
