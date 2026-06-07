import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Briefcase,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { canAccessAdminDashboard } from '../lib/permissions';
import { useAuth } from '../contexts/AuthContext';

const publicNavItems = [
  { href: '/freelancers', label: 'Freelancers' },
  { href: '/products', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
];

const freelancerNavItems = [
  { href: '/freelancers', label: 'Browse Projects' },
  { href: '/products', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
];

const clientNavItems = [
  { href: '/freelancers', label: 'Find Talent' },
  { href: '/products', label: 'Services' },
  { href: '/how-it-works', label: 'How it works' },
];

const getNavItems = (role?: string) => {
  if (role === 'FREELANCER') return freelancerNavItems;
  if (role === 'CLIENT') return clientNavItems;
  return publicNavItems;
};

const roleStyles: Record<string, string> = {
  ADMIN: 'from-purple-500 to-indigo-600',
  TEAM_MEMBER: 'from-indigo-500 to-blue-600',
  FREELANCER: 'from-blue-500 to-sky-500',
  CLIENT: 'from-emerald-500 to-teal-500',
};

const roleLabel = (role?: string) => (role ? role.replace('_', ' ').toLowerCase() : 'member');

const dashboardHref = (role?: string) => {
  if (canAccessAdminDashboard(role || '')) return '/admin';
  if (role === 'FREELANCER') return '/freelancers/dashboard';
  if (role === 'CLIENT') return '/clients/dashboard';
  return '/dashboard';
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isAdminUser = canAccessAdminDashboard(user?.role || '');
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : undefined) || 'Account';
  const navItems = getNavItems(user?.role);

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(`${href}/`);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    logout();
  };

  useEffect(() => {
    closeMenus();
  }, [router.asPath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accountLinks = [
    user
      ? {
          href: dashboardHref(user.role),
          label: isAdminUser ? 'Dashboard' : 'My dashboard',
          icon: isAdminUser ? LayoutDashboard : user.role === 'FREELANCER' ? Briefcase : ClipboardList,
        }
      : null,
    user && isAdminUser ? { href: '/admin/team', label: 'Team', icon: Users } : null,
    user && isAdminUser ? { href: '/admin/setup', label: 'Settings', icon: Settings } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/90 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />

      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          aria-label="Unitiv home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] shadow-inner shadow-white/5">
            <img src="/images/logo/logo2.1.png" alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-xl font-bold text-transparent">
              Unitiv
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:block">
              Where ideas unite your vision.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                isActive(item.href)
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && user.role !== 'FREELANCER' && (
            <Link
              href="/projects"
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Post a project
            </Link>
          )}

          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="inline-flex h-10 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] pl-1.5 pr-3 text-left transition hover:border-cyan-300/45 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${
                    roleStyles[user.role || ''] || 'from-slate-500 to-slate-700'
                  } text-xs font-bold text-white`}
                  aria-hidden="true"
                >
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[9rem] truncate text-sm font-semibold text-white/90">{displayName}</span>
                <ChevronDown
                  className={`h-4 w-4 text-white/50 transition ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {isAccountMenuOpen && (
                <div
                  className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-[#080b12]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl"
                  role="menu"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${
                        roleStyles[user.role || ''] || 'from-slate-500 to-slate-700'
                      } text-sm font-bold text-white`}
                      aria-hidden="true"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                        {roleLabel(user.role)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {accountLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                          role="menuitem"
                        >
                          <Icon className="h-4 w-4 text-cyan-200/80" aria-hidden="true" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:shadow-violet-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 md:hidden"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#07090d]/98 px-4 pb-5 pt-3 md:hidden">
          <nav className="space-y-1" aria-label="Mobile navigation">
            {[
              { href: '/', label: 'Home' },
              ...navItems,
              ...(user && user.role !== 'FREELANCER' ? [{ href: '/projects', label: 'Post a project' }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/72 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${
                      roleStyles[user.role || ''] || 'from-slate-500 to-slate-700'
                    } text-sm font-bold text-white`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-xs text-white/50">{roleLabel(user.role)}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Link
                    href={dashboardHref(user.role)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/82"
                  >
                    <UserRound className="h-4 w-4 text-cyan-200/80" aria-hidden="true" />
                    My workspace
                  </Link>
                  {isAdminUser && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/82"
                    >
                      <ShieldCheck className="h-4 w-4 text-cyan-200/80" aria-hidden="true" />
                      Admin command
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 text-sm font-bold text-white"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/80"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
