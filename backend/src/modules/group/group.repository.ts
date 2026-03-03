import { Prisma } from '@prisma/client';
import { prisma } from '../../infra/database/prisma';

export class GroupRepository {
  async findAllByUser(userId: string) {
    return prisma.group.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        accounts: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        accounts: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.GroupCreateInput) {
    return prisma.group.create({
      data,
      include: { accounts: true },
    });
  }

  async update(id: string, data: Prisma.GroupUpdateInput) {
    return prisma.group.update({
      where: { id },
      data,
      include: { accounts: true },
    });
  }

  async delete(id: string) {
    return prisma.group.delete({ where: { id } });
  }
}
