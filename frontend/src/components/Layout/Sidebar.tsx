import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', icon: Table2, label: 'Planilha' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuários', adminOnly: true },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-primary-800">
        <h1 className="text-xl font-bold tracking-tight">💰 Finance</h1>
        <p className="text-primary-300 text-sm mt-1">Controle Financeiro</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* Rodapé — Usuário */}
      <div className="p-4 border-t border-primary-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-primary-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-primary-400 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
