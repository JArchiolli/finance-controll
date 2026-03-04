import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={`flex-1 overflow-auto p-8 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'
          }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
