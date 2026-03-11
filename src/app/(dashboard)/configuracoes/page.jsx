'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { 
  User, Shield, MapPin, Link as LinkIcon, Users, Paintbrush, 
  CreditCard, Coins, MessageSquare, Phone, Upload, Save
} from 'lucide-react';
// import { createClient } from '@/lib/supabase'; // Preparado para o futuro uso SaaS

const SETTINGS_TABS = [
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'locais', label: 'Locais', icon: MapPin },
  { id: 'agendamento', label: 'Link de agendamento', icon: LinkIcon },
  { id: 'membros', label: 'Membros', icon: Users },
  { id: 'customizacao', label: 'Customização e app', icon: Paintbrush },
  { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
  { id: 'creditos', label: 'Créditos', icon: Coins },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('conta');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simula tempo de envio pro banco do Supabase
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações salvas no sistema!');
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'conta':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Sua Conta</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Atualize as informações do seu perfil público usadas nos agendamentos.
            </p>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: 'var(--bg-secondary)', border: '2px dashed var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'
                }}>
                  <User size={32} />
                </div>
                <div>
                  <button type="button" className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Upload size={16} /> Carregar nova foto
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>JPG, GIF ou PNG. Tamanho máximo de 2MB.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome Completo</label>
                  <input type="text" className="form-input" placeholder="Seu nome profissional" defaultValue="Dra. Nome Sobrenome" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email de Acesso</label>
                  <input type="email" className="form-input" placeholder="seuemail@exemplo.com" defaultValue="usuario@email.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Registro Profissional (CRN/CRM)</label>
                  <input type="text" className="form-input" placeholder="Ex: CRN 12345" />
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button type="submit" className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Alterações</>}
                </button>
              </div>
            </form>
          </div>
        );
      
      case 'seguranca':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Segurança do Sistema</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Gerencie suas senhas e ative verificações em múltiplas etapas.
            </p>

            <form onSubmit={handleSave} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} style={{ color: 'var(--primary-500)' }} /> Alterar Senha</h3>
                <div className="form-group">
                  <label className="form-label">Senha Atual</label>
                  <input type="password" className="form-input" placeholder="Digite a senha atual" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nova Senha</label>
                  <input type="password" className="form-input" placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirme Nova Senha</label>
                  <input type="password" className="form-input" placeholder="Repita a nova senha" />
                </div>
                <button type="submit" className="btn btn--primary" style={{ marginTop: '8px' }}>Atualizar Senha</button>
              </div>

              <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>Autenticação 2FA</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Aumente a proteção usando App Autenticador ou SMS.</p>
                  </div>
                  <button type="button" className="btn btn--outline" style={{ color: 'var(--primary-600)', borderColor: 'var(--primary-200)' }}>Configurar 2FA</button>
                </div>
              </div>
            </form>
          </div>
        );

      case 'agendamento':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Link Público</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Defina a URL por onde os seus pacientes poderão ver seus serviços e agendar sozinhos.
            </p>

            <form onSubmit={handleSave} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nome de usuário (Link)</label>
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', focusWithin: { borderColor: 'var(--primary-500)', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } }}>
                  <span style={{ 
                    padding: '10px 16px', background: 'var(--bg-secondary)', 
                    borderRight: '1px solid var(--border-color)',
                    color: 'var(--text-tertiary)', fontSize: '14px' 
                  }}>
                    nutrisaas.com/
                  </span>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ border: 'none', borderRadius: '0', flex: 1, boxShadow: 'none' }} 
                    placeholder="dr-seu-nome" 
                    defaultValue="dranome"
                  />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Compartilhe esse link no seu Instagram e WhatsApp profissional.</p>
              </div>

              <div className="card" style={{ padding: '20px', border: '1px dashed var(--border-color)', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                 <div>
                   <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Modo Privado</h4>
                   <p style={{ fontSize: '13px', margin: '4px 0 0', color: 'var(--text-secondary)' }}>Desativar link para não receber novos agendamentos da internet.</p>
                 </div>
                 {/* Placeholder toggle */}
                 <div style={{ width: '40px', height: '24px', background: 'var(--border-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                   <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                 </div>
              </div>

              <button type="submit" className="btn btn--primary" style={{ width: 'fit-content', marginTop: '8px' }}>Salvar Endereço Público</button>
            </form>
          </div>
        );

      default:
        const activeItem = SETTINGS_TABS.find(t => t.id === activeTab);
        return (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)' }}>
            <activeItem.icon size={32} style={{ margin: '0 auto 16px', opacity: 0.5, color: 'var(--primary-400)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)' }}>Módulo de {activeItem?.label}</h2>
            <p style={{ fontSize: '14px', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
              As funcionalidades desta seção estão sendo preparadas e logo estarão disponíveis para sua edição. 
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      <PageHeader
        title="Painel de Configurações"
        subtitle="Gerencie seu perfil, assinatura SaaS, equipe e personalizações avançadas."
        breadcrumbs={['Dashboard', 'Configurações']}
      />

      {/* Grid estilo painel SaaS */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '600px', gap: '0', padding: 0, overflow: 'hidden' }}>
        
        {/* Menu Lateral adaptável para telas grandes */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '260px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '24px 16px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '16px', paddingLeft: '12px' }}>
              Gestão da Plataforma
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                      padding: '12px 14px', borderRadius: '8px', border: 'none',
                      background: isActive ? 'var(--primary-50)' : 'transparent',
                      color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                      fontWeight: isActive ? '600' : '500', fontSize: '14px',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                         e.currentTarget.style.background = 'var(--bg-hover)';
                         e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                         e.currentTarget.style.background = 'transparent';
                         e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
                    {tab.label}
                    
                    {/* Indicador sutil esquerdo pra tab ativa */}
                    {isActive && (
                      <div style={{ position: 'absolute', left: 0, top: '15%', height: '70%', width: '3px', background: 'var(--primary-500)', borderRadius: '0 4px 4px 0' }} />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Área Principal Dinâmica */}
          <div style={{ flex: 1, padding: '40px', background: 'var(--bg-primary)', overflowY: 'auto' }}>
            {renderContent()}
          </div>
        </div>
      </div>

    </div>
  );
}
