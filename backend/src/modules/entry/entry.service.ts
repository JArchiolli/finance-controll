import { EntryRepository } from './entry.repository';
import { AccountRepository } from '../account/account.repository';
import { CreateEntryDTO, UpdateEntryDTO, UpsertEntryDTO } from './entry.dto';
import { AppError } from '../../shared/errors/AppError';

export class EntryService {
  private repository = new EntryRepository();
  private accountRepository = new AccountRepository();

  async findByYear(year: number, userId: string) {
    return this.repository.findByYear(year, userId);
  }

  async findById(id: string, userId: string) {
    const entry = await this.repository.findById(id);
    if (!entry) throw new AppError('Lançamento não encontrado', 404);
    if (entry.account?.group && entry.account.group.userId !== userId) {
      throw new AppError('Sem permissão para este lançamento', 403);
    }
    return entry;
  }

  /**
   * Verifica se a conta pertence ao usuário.
   */
  private async ensureAccountOwnership(accountId: string, userId: string) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new AppError('Conta não encontrada', 404);
    if (account.group && account.group.userId !== userId) {
      throw new AppError('Sem permissão para esta conta', 403);
    }
  }

  /**
   * Cria ou atualiza um lançamento para um mês/conta específico.
   * Usado pela planilha para "salvar célula".
   */
  async upsert(data: UpsertEntryDTO, userId: string) {
    await this.ensureAccountOwnership(data.accountId, userId);

    return this.repository.upsert(data.accountId, data.year, data.month, {
      value: data.value,
      month: data.month,
      year: data.year,
      installment: data.installment ?? null,
      totalInstallments: data.totalInstallments ?? null,
      notes: data.notes ?? null,
      paymentStatus: data.paymentStatus ?? 'PENDING',
      account: { connect: { id: data.accountId } },
    });
  }

  async create(data: CreateEntryDTO, userId: string) {
    await this.ensureAccountOwnership(data.accountId, userId);

    const existing = await this.repository.findByAccountAndMonth(
      data.accountId,
      data.year,
      data.month,
    );

    if (existing) {
      throw new AppError('Já existe um lançamento para esta conta neste mês', 409);
    }

    return this.repository.create({
      value: data.value,
      month: data.month,
      year: data.year,
      installment: data.installment ?? null,
      totalInstallments: data.totalInstallments ?? null,
      notes: data.notes ?? null,
      paymentStatus: data.paymentStatus ?? 'PENDING',
      account: { connect: { id: data.accountId } },
    });
  }

  async update(id: string, data: UpdateEntryDTO, userId: string) {
    await this.findById(id, userId);
    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    await this.repository.delete(id);
  }
}
