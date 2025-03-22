import { InMemoryUserRepository } from "@/data/repositories";
import { UserListService } from "@/data/services";
import { ConsoleLogger } from "@/infra/providers";

/**
 * Factory function that creates and configures a UserListService with all necessary dependencies.
 *
 * This factory handles the complex dependency graph required by the UserListService, including:
 * - Domain-specific use cases (user list)
 * - Data repositories
 * - Logging provider
 *
 * Using this factory centralizes the creation logic and simplifies service instantiation
 * throughout the application.
 *
 * @param {LoggerProvider} loggerProvider - The logger implementation to be injected into the service
 * @returns {UserListService} A fully configured UserListService instance ready for use
 *
 * @example
 * // Create a user service with console logging
 * const logger = new ConsoleLogger();
 * const userService = makeUserListService(logger);
 *
 * // Use the service to list users
 * const users = await userService.list();
 */
export const makeUserListService = (): UserListService => {
  const userRepository = new InMemoryUserRepository();
  const loggerProvider = new ConsoleLogger();
  return new UserListService({ userRepository, loggerProvider });
};
