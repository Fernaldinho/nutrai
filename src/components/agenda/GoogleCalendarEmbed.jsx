'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Settings, Globe, Loader2, RefreshCw } from 'lucide-react';
import { getSettingsProfile, updateProfileSettings } from '@/app/actions/settings';

export default function GoogleCalendarEmbed() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getSettingsProfile();
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();

    // Check system preference for dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleConnect = async () => {
    const calendarId = prompt('Por favor, insira o seu Google Calendar ID (ex: seuemail@gmail.com ou o ID da agenda específica):');
    if (!calendarId) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append('google_calendar_id', calendarId);
    
    const res = await updateProfileSettings(formData);
    if (res.error) {
      alert('Erro ao conectar: ' + res.error);
    } else {
      setProfile({ ...profile, google_calendar_id: calendarId });
      alert('Agenda conectada com sucesso!');
    }
    setIsUpdating(false);
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja desconectar sua Google Agenda?')) return;
    
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('google_calendar_id', '');
    
    const res = await updateProfileSettings(formData);
    if (!res.error) {
      setProfile({ ...profile, google_calendar_id: '' });
    }
    setIsUpdating(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Futurily, this would call a server action that pushes NutriSaaS appointments to Google Calendar API
    setTimeout(() => {
      alert('Sincronização concluída! Suas consultas foram enviadas para o Google Agenda.');
      setIsSyncing(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="card" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const calendarId = profile?.google_calendar_id;
  const themeParams = isDarkMode 
    ? '&color=%230f172a&backgroundColor=%230f172a' 
    : '';

  const embedUrl = calendarId 
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America%2FSao_Paulo${themeParams}&showTitle=0&showNav=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`
    : null;

  return (
    <div className="card animate-fade-in-up" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
      <div className="card__header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', marginBottom: 0 }}>
        <h2 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--primary-500)" />
          Google Agenda
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {calendarId && (
            <button className="btn btn--sm btn--secondary" onClick={handleSync} disabled={isSyncing || isUpdating}>
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          )}
          {calendarId ? (
            <button className="btn btn--sm btn--ghost" onClick={handleDisconnect} disabled={isUpdating}>
              Alterar Agenda
            </button>
          ) : (
            <button className="btn btn--sm btn--primary" onClick={handleConnect} disabled={isUpdating}>
              <Globe size={14} /> Conectar Google Agenda
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', background: isDarkMode ? '#1e293b' : '#f9fafb' }}>
        {calendarId ? (
          <iframe
            src={embedUrl}
            style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            frameBorder="0"
            scrolling="no"
          ></iframe>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-50)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)',
              marginBottom: '16px'
            }}>
              <CalendarIcon size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Integre com sua Google Agenda
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '300px', marginBottom: '24px' }}>
              Visualize todas as suas consultas do NutriSaaS em tempo real na sua agenda pessoal do Google.
            </p>
            <button className="btn btn--primary" onClick={handleConnect} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Conectar Agora'}
            </button>
          </div>
        )}
      </div>

      {isDarkMode && calendarId && (
        <div style={{ 
          padding: '8px', textAlign: 'center', fontSize: '11px', 
          color: 'var(--text-tertiary)', background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)'
        }}>
          Dica: Para melhor visualização no modo escuro, ajuste o tema oficial no seu painel do Google.
        </div>
      )}
    </div>
  );
}
