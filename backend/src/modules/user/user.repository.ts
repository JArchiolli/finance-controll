import { Prisma } from '@prisma/client';
import { prisma } from '../../infra/database/prisma';

/**
 * Repository Pattern — encapsula o acesso a dados de User.
 * Abstrai o Prisma, facilitando testes e eventual troca de ORM.
 */
export class UserRepository {
  private readonly select: Prisma.UserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  async findAll() {
    return prisma.user.findMany({
      select: this.select,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: this.select,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: this.select,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: this.select,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
