'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Apple,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/medical-records', label: 'Prontuários', icon: BookOpen },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
];

const bottomItems = [
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Carregando...');
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        const name = profile?.name || user.email?.split('@')[0] || 'Nutricionista';
        setUserName(name);
      } else {
        setUserName('Usuário Desconectado');
      }
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      <div
        className={`sidebar__overlay ${isOpen ? 'sidebar__overlay--visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <Apple size={20} />
          </div>
          <div className="sidebar__brand">
            <span className="sidebar__title">NutriSaaS</span>
            <span className="sidebar__subtitle">Nutrição Digital</span>
          </div>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)' }}
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          <span className="sidebar__section-title">Menu Principal</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${isActive(item.href) ? 'sidebar__link--active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} className="sidebar__link-icon" />
                {item.label}
              </Link>
            );
          })}

          <span className="sidebar__section-title">Sistema</span>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${isActive(item.href) ? 'sidebar__link--active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} className="sidebar__link-icon" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar" title={userName}>
              {userName === 'Carregando...' ? '...' : userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name" title={userName}>{userName}</div>
              <div className="sidebar__user-role">Nutricionista</div>
            </div>
            <form action={logout}>
              <button type="submit" className="sidebar__logout" title="Sair" style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
