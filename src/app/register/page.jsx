'use client';

import Link from 'next/link';
import { Apple, Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { signup } from '@/app/actions/auth';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData) {
    setIsPending(true);
    setError(null);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsPending(false);
      return;
    }
    
    // Server Action
    const result = await signup(formData);
    
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

          <h1 className="auth-title">Crie sua conta</h1>
          <p className="auth-subtitle">Comece a gerenciar seu consultório de forma moderna.</p>

          <form action={handleSubmit}>
            {error && (
              <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">Nome completo</label>
              <div style={{ position: 'relative' }}>
                <User
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
                  id="name"
                  name="name"
                  required
                  type="text"
                  className="form-input"
                  placeholder="Dra. Maria Silva"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

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
                  required
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
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
                  placeholder="Mínimo 8 caracteres"
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

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar senha</label>
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
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  type="password"
                  className="form-input"
                  placeholder="Repita sua senha"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={isPending} className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '8px' }}>
              {isPending ? <Loader2 size={20} className="animate-spin" /> : 'Criar conta'}
            </button>
          </form>

          <div className="auth-footer">
            Já tem uma conta?{' '}
            <Link href="/login">Fazer login</Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="auth-hero">
        <div className="auth-hero__content">
          <div className="auth-hero__icon">
            <Apple size={36} />
          </div>
          <h2 className="auth-hero__title">Comece gratuitamente</h2>
          <p className="auth-hero__text">
            Junte-se a milhares de nutricionistas que já utilizam o NutriSaaS para transformar a gestão de seus consultórios.
          </p>
        </div>
      </div>
    </div>
  );
}
