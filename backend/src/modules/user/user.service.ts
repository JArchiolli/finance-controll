import { UserRepository } from './user.repository';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { hashPassword } from '../../shared/utils/hash';
import { AppError } from '../../shared/errors/AppError';

export class UserService {
  private repository = new UserRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }

  async create(data: CreateUserDTO) {
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) throw new AppError('Email já está em uso', 409);

    const hashedPassword = await hashPassword(data.password);

    return this.repository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id); // garante que existe

    if (data.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new AppError('Email já está em uso', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...data };

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    return this.repository.update(id, updateData);
  }

  async delete(id: string, requestingUserId?: string) {
    if (requestingUserId && id === requestingUserId) {
      throw new AppError('Você não pode excluir sua própria conta', 403);
    }

    await this.findById(id);
    await this.repository.delete(id);
  }
}
