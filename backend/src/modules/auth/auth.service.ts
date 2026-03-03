import { prisma } from '../../infra/database/prisma';
import { comparePassword } from '../../shared/utils/hash';
import { generateToken } from '../../shared/utils/jwt';
import { AppError } from '../../shared/errors/AppError';
import { LoginDTO } from './auth.dto';

export class AuthService {
  async login({ email, password }: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = generateToken({ sub: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }
}
