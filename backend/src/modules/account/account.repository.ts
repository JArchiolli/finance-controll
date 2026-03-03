import { Prisma } from '@prisma/client';
import { prisma } from '../../infra/database/prisma';

export class AccountRepository {
  async findAllByUser(userId: string) {
    return prisma.account.findMany({
      where: { group: { userId } },
      orderBy: { order: 'asc' },
      include: { group: true },
    });
  }

  async findById(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: { group: true },
    });
  }

  async findByGroupId(groupId: string) {
    return prisma.account.findMany({
      where: { groupId },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: Prisma.AccountCreateInput) {
    return prisma.account.create({
      data,
      include: { group: true },
    });
  }

  async update(id: string, data: Prisma.AccountUpdateInput) {
    return prisma.account.update({
      where: { id },
      data,
      include: { group: true },
    });
  }

  async delete(id: string) {
    return prisma.account.delete({ where: { id } });
  }
}
