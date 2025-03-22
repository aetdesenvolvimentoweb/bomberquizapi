import { User } from "@/domain/entities";

export interface UserAuthenticationData {
  email: string;
  password: string;
}

export interface UserAuthenticationResult {
  user: Omit<User, "password">;
  accessToken: string;
}

export interface UserAuthenticateUseCase {
  authenticate(data: UserAuthenticationData): Promise<UserAuthenticationResult>;
}
