import { Prisma } from '@prisma/client';
import { prisma } from '../../infra/database/prisma';

export class EntryRepository {
  async findByYear(year: number, userId: string) {
    return prisma.entry.findMany({
      where: { year, account: { group: { userId } } },
      include: {
        account: {
          include: { group: true },
        },
      },
      orderBy: [{ month: 'asc' }],
    });
  }

  async findById(id: string) {
    return prisma.entry.findUnique({
      where: { id },
      include: {
        account: {
          include: { group: true },
        },
      },
    });
  }

  async findByAccountAndMonth(accountId: string, year: number, month: number) {
    return prisma.entry.findUnique({
      where: {
        accountId_year_month: { accountId, year, month },
      },
    });
  }

  async upsert(accountId: string, year: number, month: number, data: Prisma.EntryCreateInput) {
    return prisma.entry.upsert({
      where: {
        accountId_year_month: { accountId, year, month },
      },
      update: {
        value: data.value,
        installment: data.installment,
        totalInstallments: data.totalInstallments,
        notes: data.notes,
        paymentStatus: data.paymentStatus,
      },
      create: data,
      include: {
        account: {
          include: { group: true },
        },
      },
    });
  }

  async create(data: Prisma.EntryCreateInput) {
    return prisma.entry.create({
      data,
      include: {
        account: {
          include: { group: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.EntryUpdateInput) {
    return prisma.entry.update({
      where: { id },
      data,
      include: {
        account: {
          include: { group: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.entry.delete({ where: { id } });
  }

  /**
   * Dados agregados para o dashboard: total por mês de um ano (filtrado por usuário).
   */
  async sumByMonth(year: number, userId: string) {
    return prisma.entry.groupBy({
      by: ['month'],
      where: { year, account: { group: { userId } } },
      _sum: { value: true },
      orderBy: { month: 'asc' },
    });
  }

  /**
   * Total por grupo em um ano (filtrado por usuário).
   */
  async sumByGroup(year: number, userId: string) {
    const result = await prisma.$queryRaw<Array<{ group_name: string; total: number }>>`
      SELECT g.name as group_name, COALESCE(SUM(e.value), 0)::float as total
      FROM entries e
      JOIN accounts a ON a.id = e.account_id
      JOIN groups g ON g.id = a.group_id
      WHERE e.year = ${year} AND g.user_id = ${userId}
      GROUP BY g.name, g."order"
      ORDER BY g."order" ASC
    `;
    return result;
  }
}
