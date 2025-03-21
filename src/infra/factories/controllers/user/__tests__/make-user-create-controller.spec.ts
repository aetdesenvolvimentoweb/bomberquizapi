import * as factories from "@/infra/factories";
import { makeUserCreateController } from "@/infra/factories/controllers/user/make-user-create-controller";
import { ConsoleLogger } from "@/infra/providers";
import { UserCreateController } from "@/presentation/controllers";

// Mock dependencies
jest.mock("@/presentation/controllers");
jest.mock("@/infra/providers");
jest.mock("@/infra/factories");

describe("makeUserCreateController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create and return a UserCreateController instance with correct dependencies", () => {
    // Mock implementations
    const mockUserCreateService = { execute: jest.fn() };
    const mockLoggerProvider = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    };

    // Setup mocks
    (ConsoleLogger as jest.Mock).mockImplementation(() => mockLoggerProvider);
    (factories.makeUserCreateService as jest.Mock).mockReturnValue(
      mockUserCreateService,
    );
    (UserCreateController as jest.Mock).mockImplementation(
      ({ userCreateService, loggerProvider }) => ({
        userCreateService,
        loggerProvider,
        handle: jest.fn(),
      }),
    );

    // Call the factory function
    const controller = makeUserCreateController();

    // Assertions
    expect(ConsoleLogger).toHaveBeenCalledTimes(1);
    expect(factories.makeUserCreateService).toHaveBeenCalledWith(
      mockLoggerProvider,
    );
    expect(UserCreateController).toHaveBeenCalledWith({
      userCreateService: mockUserCreateService,
    });

    // Verify the controller was created with correct dependencies
    expect(controller).toHaveProperty(
      "userCreateService",
      mockUserCreateService,
    );
    expect(controller).toHaveProperty("handle");
  });
});
