import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', icon: Table2, label: 'Planilha' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuários', adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-900 text-white flex flex-col z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* Header */}
      <div className={`flex items-center border-b border-primary-800 ${collapsed ? 'justify-center p-4' : 'justify-between p-6'
        }`}>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold tracking-tight">💰 Finance</h1>
            <p className="text-primary-300 text-sm mt-1">Controle Financeiro</p>
          </div>
        )}
        {collapsed && <span className="text-xl">💰</span>}
        <button
          onClick={onToggle}
          className="p-1.5 text-primary-400 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''
                } ${isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-primary-800">
        {collapsed ? (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 text-primary-400 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 py-1">
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
        )}
      </div>
    </aside>
  );
}
