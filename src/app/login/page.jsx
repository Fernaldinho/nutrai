'use client';

import Link from 'next/link';
import { Apple, Mail, Lock, Eye, EyeOff, Users, CalendarDays, BookOpen, BarChart3, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData) {
    setIsPending(true);
    setError(null);
    
    // Server Action
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="auth-layout">
      {/* Form Section */}
      <div className="auth-form-section">
        <div className="auth-form-container animate-fade-in-up">
          <div className="auth-brand">
            <div className="auth-brand__logo">
              <Apple size={22} />
            </div>
            <span className="auth-brand__name">NutriSaaS</span>
          </div>

          <h1 className="auth-title">Bem-vindo de volta!</h1>
          <p className="auth-subtitle">Entre na sua conta para continuar.</p>

          <form action={handleSubmit}>
            {error && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="seu@email.com"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password">Senha</label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: '500' }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isPending} className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '8px' }}>
              {isPending ? <Loader2 size={20} className="animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            Não tem uma conta?{' '}
            <Link href="/register">Criar conta gratuita</Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="auth-hero">
        <div className="auth-hero__content">
          <div className="auth-hero__icon">
            <Apple size={36} />
          </div>
          <h2 className="auth-hero__title">Seu consultório na palma da mão</h2>
          <p className="auth-hero__text">
            Gerencie pacientes, consultas e planos alimentares com a plataforma mais moderna para nutricionistas.
          </p>
          <div className="auth-hero__features">
            <div className="auth-hero__feature">
              <div className="auth-hero__feature-icon"><Users size={16} /></div>
              Gestão completa de pacientes
            </div>
            <div className="auth-hero__feature">
              <div className="auth-hero__feature-icon"><CalendarDays size={16} /></div>
              Agenda inteligente com lembretes
            </div>
            <div className="auth-hero__feature">
              <div className="auth-hero__feature-icon"><BookOpen size={16} /></div>
              Diários alimentares automatizados
            </div>
            <div className="auth-hero__feature">
              <div className="auth-hero__feature-icon"><BarChart3 size={16} /></div>
              Relatórios e métricas de evolução
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
