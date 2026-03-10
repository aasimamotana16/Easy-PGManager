import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building,
  CalendarCheck2,
  Wallet,
  FileText,
  MessageSquare,
  FileCheck,
  Menu,
  X,
  LogOut,
  Bell,
  Mail,
  Star,
  Settings,
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tenants', href: '/users', icon: Users },
  { name: 'Owners', href: '/owners', icon: UserCheck },
  { name: 'PGs', href: '/pgs', icon: Building },
  { name: 'Bookings', href: '/bookings', icon: CalendarCheck2 },
  { name: 'Payments', href: '/payments', icon: Wallet },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Requests', href: '/requests', icon: Bell },
  { name: 'Contacts', href: '/contacts', icon: Mail },
  { name: 'Agreements', href: '/agreements', icon: FileCheck },
  { name: 'Reviews', href: '/reviews', icon: Star },
  { name: 'FAQs', href: '/faqs', icon: HelpCircle },
  { name: 'Agreement Settings', href: '/agreement-settings', icon: Settings },
  { name: 'Pricing Rules', href: '/pricing-rules', icon: SlidersHorizontal }
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const activePageName = useMemo(() => {
    const found = sidebarItems.find((item) => location.pathname.startsWith(item.href));
    return found?.name || 'Dashboard';
  }, [location.pathname]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutSuccessful(true);
    setTimeout(() => {
      logout();
      setIsLogoutSuccessful(false);
      setIsLogoutModalOpen(false);
    }, 800);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 transform flex-col overflow-hidden border-r border-white/10 bg-[#0f1728] px-4 pb-4 pt-5 text-slate-100 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20">
              <img src="/logos/logo1.png" alt="EasyPG Logo" className="h-full w-full rounded-md object-cover" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-white">EasyPG Admin</p>
              <p className="text-xs text-slate-300">Control Center</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="hide-scrollbar mb-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/25'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.username || 'Admin'}</p>
              <p className="truncate text-xs uppercase tracking-wide text-slate-300">{user?.role || 'admin'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/75 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">{activePageName}</h1>
                <p className="text-xs text-slate-500">EasyPG Admin Panel</p>
              </div>
            </div>
            <div className="hidden rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm sm:block">
              {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-3 py-4 sm:px-6 sm:py-6">{children || <Outlet />}</main>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/60 bg-white p-6 text-center shadow-2xl">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900">Confirm Logout</h3>
                <p className="mt-2 text-sm text-slate-600">Are you sure you want to end your session?</p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="epg-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={confirmLogout} className="epg-btn-primary flex-1">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="py-3">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                  OK
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Success</h3>
                <p className="mt-2 text-sm text-slate-600">Logged out successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

