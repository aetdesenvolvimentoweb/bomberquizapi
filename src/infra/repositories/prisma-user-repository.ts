import { User, UserCreateData, UserMapped, UserRole } from "@/domain/entities";
import { UserRepository } from "@/domain/repositories";

import { prismaClient } from "../adapters/prisma-client-adapter";

export class PrismaUserRepository implements UserRepository {
  private userMap = (user: User): UserMapped => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      avatarUrl: user.avatarUrl,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  public readonly create = async (data: UserCreateData): Promise<void> => {
    await prismaClient.user.create({
      data,
    });
  };

  public readonly findByEmail = async (email: string): Promise<User | null> => {
    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return { ...user, role: user.role as UserRole };
    }

    return null;
  };

  public readonly list = async (): Promise<UserMapped[]> => {
    const users = await prismaClient.user.findMany();

    return users.map((user) =>
      this.userMap({ ...user, role: user.role as UserRole }),
    );
  };
}
