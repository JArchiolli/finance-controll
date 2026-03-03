import { AccountRepository } from './account.repository';
import { GroupRepository } from '../group/group.repository';
import { CreateAccountDTO, UpdateAccountDTO } from './account.dto';
import { AppError } from '../../shared/errors/AppError';

export class AccountService {
  private repository = new AccountRepository();
  private groupRepository = new GroupRepository();

  async findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  async findById(id: string, userId: string) {
    const account = await this.repository.findById(id);
    if (!account) throw new AppError('Conta não encontrada', 404);
    if (account.group && account.group.userId !== userId) {
      throw new AppError('Sem permissão para esta conta', 403);
    }
    return account;
  }

  async create(data: CreateAccountDTO, userId: string) {
    // Verificar se o grupo pertence ao usuário
    const group = await this.groupRepository.findById(data.groupId);
    if (!group) throw new AppError('Grupo não encontrado', 404);
    if (group.userId !== userId) throw new AppError('Sem permissão para este grupo', 403);

    return this.repository.create({
      name: data.name,
      order: data.order,
      group: { connect: { id: data.groupId } },
    });
  }

  async update(id: string, data: UpdateAccountDTO, userId: string) {
    await this.findById(id, userId);

    if (data.groupId) {
      const group = await this.groupRepository.findById(data.groupId);
      if (!group) throw new AppError('Grupo não encontrado', 404);
      if (group.userId !== userId) throw new AppError('Sem permissão para este grupo', 403);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.groupId) updateData.group = { connect: { id: data.groupId } };

    return this.repository.update(id, updateData);
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    await this.repository.delete(id);
  }
}
