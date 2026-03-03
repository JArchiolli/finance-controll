import { GroupRepository } from './group.repository';
import { CreateGroupDTO, UpdateGroupDTO } from './group.dto';
import { AppError } from '../../shared/errors/AppError';

export class GroupService {
  private repository = new GroupRepository();

  async findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  async findById(id: string, userId: string) {
    const group = await this.repository.findById(id);
    if (!group) throw new AppError('Grupo não encontrado', 404);
    if (group.userId !== userId) throw new AppError('Sem permissão para este grupo', 403);
    return group;
  }

  async create(data: CreateGroupDTO, userId: string) {
    return this.repository.create({
      name: data.name,
      order: data.order,
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, data: UpdateGroupDTO, userId: string) {
    await this.findById(id, userId);
    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    await this.repository.delete(id);
  }
}
