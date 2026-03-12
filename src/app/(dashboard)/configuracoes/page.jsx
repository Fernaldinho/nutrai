'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { 
  User, Shield, MapPin, Link as LinkIcon, Users, Paintbrush, 
  CreditCard, MessageSquare, Phone, Upload, Save, XCircle, Map, UserCircle
} from 'lucide-react';
import { getSettingsProfile, updateProfileSettings, listLocations, createLocation, deleteLocation } from '@/app/actions/settings';
import { updatePassword } from '@/app/actions/auth';

const SETTINGS_TABS = [
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'locais', label: 'Locais', icon: MapPin },
  { id: 'agendamento', label: 'Link de agendamento', icon: LinkIcon },
  { id: 'membros', label: 'Membros', icon: Users },
  { id: 'customizacao', label: 'Customização e app', icon: Paintbrush },
  { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('conta');
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, locData] = await Promise.all([
        getSettingsProfile(),
        listLocations()
      ]);
      setProfile(profData);
      setLocations(locData);
      if (profData?.avatar_url) setAvatarPreview(profData.avatar_url);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    if (avatarPreview && avatarPreview.startsWith('data:image')) {
      formData.append('avatar_url', avatarPreview);
    }
    const res = await updateProfileSettings(formData);
    if (res?.error) {
      alert('Erro: ' + res.error);
    } else {
      alert('Configurações salvas!');
      fetchData();
    }
    setIsSaving(false);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const newPass = formData.get('newPassword');
    const confirmPass = formData.get('confirmPassword');

    if (!newPass || newPass.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      setIsSaving(false);
      return;
    }

    if (newPass !== confirmPass) {
      alert('As senhas não coincidem!');
      setIsSaving(false);
      return;
    }

    const res = await updatePassword(formData);
    
    if (res?.error) {
      alert('Erro ao atualizar senha: ' + res.error);
    } else {
      alert('Senha atualizada com sucesso!');
      e.target.reset();
    }
    
    setIsSaving(false);
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const res = await createLocation(formData);
    if (res?.error) alert('Erro: ' + res.error);
    else {
      e.target.reset();
      fetchData();
    }
    setIsSaving(false);
  };

  const handleRemoveLoc = async (id) => {
    if (!confirm('Excluir este local?')) return;
    const res = await deleteLocation(id);
    if (!res?.error) fetchData();
  };

  const handleSaveSimulated = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const res = await updateProfileSettings(formData);
    if (res?.error) alert('Erro: ' + res.error);
    else {
      alert('Configurações do módulo salvas!');
      fetchData();
    }
    setIsSaving(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados...</div>;

    switch (activeTab) {
      case 'conta':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Sua Conta</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Atualize as informações do seu perfil público usadas nos agendamentos.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                gap: '24px', 
                marginBottom: '32px', 
                paddingBottom: '32px', 
                borderBottom: '1px solid var(--border-light)' 
              }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: 'var(--bg-secondary)', border: '2px dashed var(--border-medium)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {avatarPreview ? (
                     <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <User size={32} />
                  )}
                </div>
                <div style={{ minWidth: '200px', flex: 1 }}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" style={{ display: 'none' }} />
                  <button type="button" className="btn btn--outline" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', padding: '6px 12px', borderRadius: '6px', minHeight: 'unset' }}>
                    <Upload size={16} /> Carregar nova foto
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>JPG, GIF ou PNG. Tamanho máximo de 2MB.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome Completo</label>
                  <input type="text" name="name" className="form-input" placeholder="Seu nome profissional" defaultValue={profile?.name || ''} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email de Acesso</label>
                  <input type="email" name="email" className="form-input" placeholder="seuemail@exemplo.com" defaultValue={profile?.email || ''} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Registro Profissional (CRN/CRM)</label>
                  <input type="text" name="crn" className="form-input" placeholder="Ex: CRN 12345" defaultValue={profile?.crn || ''} />
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
              Gerencie a senha de acesso da sua conta.
            </p>

            <form onSubmit={handleSavePassword} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} style={{ color: 'var(--primary-500)' }} /> Alterar Senha</h3>
                <div className="form-group">
                  <label className="form-label">Senha Atual</label>
                  <input type="password" name="currentPassword" className="form-input" placeholder="Digite a senha atual" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nova Senha</label>
                  <input type="password" name="newPassword" className="form-input" placeholder="Mínimo 8 caracteres" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirme Nova Senha</label>
                  <input type="password" name="confirmPassword" className="form-input" placeholder="Repita a nova senha" required />
                </div>
                <button type="submit" className="btn btn--primary" style={{ marginTop: '8px' }} disabled={isSaving}>Atualizar Senha</button>
              </div>
            </form>
          </div>
        );

      case 'locais':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Locais de Atendimento</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Adicione e gerencie os lugares onde você realiza suas consultas (clínicas, online, etc).
            </p>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: 0 }}>
              {/* Form Add */}
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Novo Local</h3>
                <form onSubmit={handleAddLocation}>
                  <div className="form-group">
                    <label className="form-label">Nome do Local</label>
                    <input type="text" name="name" className="form-input" placeholder="Ex: Clínica Alpha, Online..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Endereço Completo ou Link</label>
                    <input type="text" name="address" className="form-input" placeholder="Ex: Av. Paulista, 1000 - SP" />
                  </div>
                  <button type="submit" className="btn btn--primary" disabled={isSaving} style={{ width: '100%' }}>Adicionar</button>
                </form>
              </div>
              
              {/* Lista */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Locais Cadastrados ({locations.length})</h3>
                {locations.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
                    <Map size={24} style={{ margin: '0 auto 8px', color: 'var(--text-tertiary)' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhum local cadastrado.</p>
                  </div>
                ) : (
                  locations.map(loc => (
                    <div key={loc.id} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</h4>
                        {loc.address && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.address}</p>}
                      </div>
                      <button onClick={() => handleRemoveLoc(loc.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }} title="Remover">
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'agendamento':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Link Público</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Defina a URL por onde os seus pacientes poderão ver seus serviços e agendar sozinhos.
            </p>

            <form onSubmit={handleSaveSimulated} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nome de usuário (Link)</label>
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <span style={{ 
                    padding: '10px 16px', background: 'var(--bg-secondary)', 
                    borderRight: '1px solid var(--border-light)',
                    color: 'var(--text-tertiary)', fontSize: '14px' 
                  }}>
                    nutrisaas.com/
                  </span>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ border: 'none', borderRadius: '0', flex: 1, boxShadow: 'none' }} 
                    placeholder="dr-seu-nome" 
                    defaultValue={profile?.name?.toLowerCase().replace(/\s+/g, '-') || 'usuario'}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: 'fit-content' }}>Salvar Endereço</button>
            </form>
          </div>
        );

      case 'customizacao':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Customização Visual</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Altere as cores principais do seu dashboard. (As mudanças serão aplicadas globalmente se usar o CSS customizável em implementações futuras).
            </p>

            <form onSubmit={handleSaveSimulated} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Tema Base</label>
                <select name="custom_theme" className="form-input" defaultValue={profile?.custom_theme || 'light'}>
                  <option value="light">Claro (Light Mode)</option>
                  <option value="dark">Escuro (Dark Mode)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cor de destaque (Hex)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" name="custom_color" defaultValue={profile?.custom_color || '#06c2ae'} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }} />
                  <input type="text" className="form-input" disabled value={profile?.custom_color || '#06c2ae'} style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }} />
                </div>
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: 'fit-content' }} disabled={isSaving}>Alterar Cores</button>
            </form>
          </div>
        );

      case 'assinatura':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Assinatura e Plano</h2>
            <div className="card" style={{ maxWidth: '600px', padding: '24px', border: '1px solid var(--primary-200)', background: 'var(--primary-50)' }}>
               <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-800)', fontWeight: '700', marginBottom: '8px' }}>Plano Atual: {profile?.signature_plan || 'Gratuito'}</h3>
               <p style={{ fontSize: '13px', color: 'var(--primary-700)', marginBottom: '16px' }}>
                 Você está utilizando o plano base da plataforma NutriSaaS.
               </p>
               <button className="btn btn--primary" style={{ width: '100%' }}>Fazer Upgrade para o PRO</button>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>WhatsApp Oficial</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Configure o número do WhatsApp onde seus pacientes farão contato através do link público.
            </p>

            <form onSubmit={handleSaveSimulated} style={{ maxWidth: '600px', display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Número de Contato</label>
                <input type="text" name="whatsapp_number" className="form-input" placeholder="(11) 99999-9999" defaultValue={profile?.whatsapp_number || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Mensagem Padrão de Recepção</label>
                <textarea name="whatsapp_message" className="form-input" rows="3" placeholder="Olá! Gostaria de agendar uma consulta." defaultValue={profile?.whatsapp_message || ''}></textarea>
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: 'fit-content' }} disabled={isSaving}>Salvar Configuração</button>
            </form>
          </div>
        );

      // Membros, Mensagens
      default:
        const activeItem = SETTINGS_TABS.find(t => t.id === activeTab);
        return (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-medium)', borderRadius: '12px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
            <activeItem.icon size={32} style={{ margin: '0 auto 16px', opacity: 0.5, color: 'var(--primary-400)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)' }}>Módulo de {activeItem?.label}</h2>
            <p style={{ fontSize: '14px', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
              As funcionalidades desta seção farão parte da próxima grande atualização da plataforma.
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      <PageHeader
        title="Painel de Configurações"
        subtitle="Gerencie seu perfil, assinatura SaaS, locais e integrações."
        breadcrumbs={['Dashboard', 'Configurações']}
      />

      {/* Grid estilo painel SaaS */}
      <div className="settings-container">
        
        {/* Menu Lateral adaptável para telas grandes */}
        <div className="settings-sidebar">
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '16px', paddingLeft: '12px' }}>
            Gestão da Plataforma
          </h3>
          <nav className="settings-nav">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-tab-btn ${isActive ? 'settings-tab-btn--active' : ''}`}
                >
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.6 }} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Área Principal Dinâmica */}
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>

    </div>
  );
}
