'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

export default function CalendarCard({ appointments = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isConnecting, setIsConnecting] = useState(false);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Gerar dias do mês
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Espaços vazios para o início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        date: date,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        hasEvent: appointments.some(app => new Date(app.date).toDateString() === date.toDateString())
      });
    }
    
    return days;
  }, [currentDate, selectedDate, appointments]);

  const selectedAppointments = useMemo(() => {
    return appointments.filter(app => 
      new Date(app.date).toDateString() === selectedDate.toDateString()
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [selectedDate, appointments]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleConnectGoogle = () => {
    setIsConnecting(true);
    // Simula redirecionamento
    setTimeout(() => {
      alert('Redirecionando para fluxo OAuth do Google Calendar...\n\n(A integração real será implementada no backend)');
      setIsConnecting(false);
    }, 800);
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="calendar-container">
        {/* Header do Calendário */}
        <div className="calendar-header">
          <div className="calendar-header__title">
            <CalendarIcon size={18} className="text-primary-500" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="btn-icon btn-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="btn-icon btn-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="calendar-grid">
          {dayLabels.map(label => (
            <div key={label} className="calendar-day-label">{label}</div>
          ))}
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              className={`calendar-day ${dayObj.day ? '' : 'calendar-day--empty'} ${dayObj.isToday ? 'calendar-day--today' : ''} ${dayObj.isSelected ? 'calendar-day--selected' : ''}`}
              onClick={() => dayObj.date && setSelectedDate(dayObj.date)}
            >
              {dayObj.day}
              {dayObj.hasEvent && <div className="calendar-day__has-event"></div>}
            </div>
          ))}
        </div>

        {/* Lista de Consultas do Dia Selecionado */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Consultas para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.7 }}>{selectedAppointments.length} agendadas</span>
          </h3>
          
          <div className="appointment-mini-list">
            {selectedAppointments.length > 0 ? (
              selectedAppointments.map(app => (
                <div key={app.id} className="appointment-mini-item">
                  <div className="appointment-mini-time">
                    {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="appointment-mini-info">
                    <div className="appointment-mini-name">{app.patients?.name || 'Paciente Externo'}</div>
                    <div className="appointment-mini-type">{app.notes || 'Consulta Nutricional'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--gray-25)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)' }}>
                Nenhuma consulta para este dia.
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar Connect */}
        {/* Google Calendar Connect */}
        <button 
          className="google-connect-btn" 
          title="Integração via OAuth"
          onClick={handleConnectGoogle}
          disabled={isConnecting}
          style={{ cursor: isConnecting ? 'wait' : 'pointer', opacity: isConnecting ? 0.7 : 1 }}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isConnecting ? 'Aguardando Google...' : 'Conectar Google Agenda'}
        </button>
      </div>
    </div>
  );
}
