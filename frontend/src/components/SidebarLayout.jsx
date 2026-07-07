import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Settings, LogOut, Menu, X, Shield, Bell } from 'lucide-react';

export default function SidebarLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Integration', path: '/dashboard/settings', icon: Settings, end: false },
  ];

  const getInitials = (name) => {
    if (!name) return 'WD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#060817] text-gray-100 font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/25 shadow-[0_0_15px_rgba(99,117,255,0.2)]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-gray-200 to-brand-400 bg-clip-text text-transparent font-sans">
            Email WatchDog
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 glass-panel border-r border-white/5 flex flex-col justify-between z-30 transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-white/5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_20px_rgba(99,117,255,0.25)]">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider text-white">Email WatchDog</h1>
              <p className="text-[10px] text-brand-400/80 font-medium tracking-widest uppercase">Security Shield</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2 mt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group
                    ${isActive 
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(99,117,255,0.1)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-400 shadow-[0_0_10px_rgba(99,117,255,0.1)]">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen relative bg-gradient-to-br from-[#060817] via-[#090e29] to-[#040612]">
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen pb-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
