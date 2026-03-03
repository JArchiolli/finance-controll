import { EntryRepository } from '../entry/entry.repository';

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export class DashboardService {
  private entryRepository = new EntryRepository();

  async getSummary(year: number, userId: string) {
    const [monthlyTotals, groupTotals] = await Promise.all([
      this.entryRepository.sumByMonth(year, userId),
      this.entryRepository.sumByGroup(year, userId),
    ]);

    // Montar array de 12 meses com total (mesmo que zero)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyTotals.find((m) => m.month === i + 1);
      return {
        month: i + 1,
        label: MONTH_LABELS[i],
        total: found?._sum.value ? Number(found._sum.value) : 0,
      };
    });

    const yearTotal = monthlyData.reduce((acc, m) => acc + m.total, 0);
    const monthAverage = yearTotal / 12;

    return {
      year,
      yearTotal,
      monthAverage,
      monthlyData,
      groupData: groupTotals.map((g) => ({
        name: g.group_name,
        total: Number(g.total),
      })),
    };
  }
}
