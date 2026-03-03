import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '../components/Layout/Header';
import { Modal, useModal } from '../components/ui/Modal';
import { userService, type CreateUserPayload, type UpdateUserPayload } from '../services/user.service';
import type { User } from '../types';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const modal = useModal();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' as 'ADMIN' | 'USER' });

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await userService.findAll();
      setUsers(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreateModal() {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'USER' });
    modal.open();
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    modal.open();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await userService.update(editingUser.id, payload);
        toast.success('Usuário atualizado!');
      } else {
        const payload: CreateUserPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        await userService.create(payload);
        toast.success('Usuário criado!');
      }

      modal.close();
      loadUsers();
    } catch {
      toast.error('Erro ao salvar usuário');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      await userService.delete(id);
      toast.success('Usuário deletado!');
      loadUsers();
    } catch {
      toast.error('Erro ao deletar usuário');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Usuários" subtitle="Gerenciar usuários do sistema">
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Usuário
        </button>
      </Header>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Nome</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-center px-6 py-3 font-semibold text-slate-600">Perfil</th>
              <th className="text-center px-6 py-3 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha {editingUser && <span className="text-slate-400">(deixe em branco para não alterar)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input"
              placeholder="••••••"
              required={!editingUser}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'USER' }))}
              className="input"
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={modal.close} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
