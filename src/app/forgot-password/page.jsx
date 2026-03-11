'use client';

import Link from 'next/link';
import { Apple, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
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

          <h1 className="auth-title">Recuperar senha</h1>
          <p className="auth-subtitle">
            Digite seu email e enviaremos um link para você redefinir sua senha.
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
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
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '8px' }}>
              Enviar link de recuperação
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
              }}
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="auth-hero">
        <div className="auth-hero__content">
          <div className="auth-hero__icon">
            <Mail size={36} />
          </div>
          <h2 className="auth-hero__title">Não se preocupe</h2>
          <p className="auth-hero__text">
            Acontece com todos! Enviaremos um link seguro para o seu email para que você possa redefinir sua senha rapidamente.
          </p>
        </div>
      </div>
    </div>
  );
}
