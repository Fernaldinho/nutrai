'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { CalendarDays, Plus, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { createAppointment, updateAppointmentStatus, deleteAppointment } from '@/app/actions/appointments';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointmentColumns = [
    {
      key: 'date',
      label: 'Data/Hora',
      render: (val) => new Date(val).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    },
    { key: 'patient_name', label: 'Paciente' },
    { key: 'notes', label: 'Notas/Tipo' },
    {
      key: 'status',
      label: 'Status',
      render: (val, item) => (
        <select 
          value={val} 
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          className={`status-badge-select status-badge--${val === 'confirmado' || val === 'concluido' ? 'success' : val === 'pendente' ? 'warning' : 'danger'}`}
        >
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, item) => (
        <button 
          className="btn-link" 
          style={{ color: 'var(--danger-500)', border: 'none', background: 'none', cursor: 'pointer' }}
          onClick={() => handleDelete(item.id)}
        >
          Remover
        </button>
      )
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsData, patientsData] = await Promise.all([
        appointmentService.listAppointments(),
        patientService.listPatients()
      ]);

      setAppointments(appsData.map(a => ({
        ...a,
        patient_name: a.patients?.name || 'Paciente Externo'
      })));
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao buscar dados da agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (!res.error) fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este agendamento?')) return;
    const res = await deleteAppointment(id);
    if (!res.error) fetchData();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await createAppointment(formData);
    
    if (res.error) alert('Erro: ' + res.error);
    else {
      setIsModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Visualize e gerencie suas consultas e compromissos."
        breadcrumbs={['Dashboard', 'Agenda']}
        actions={
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Nova Consulta
          </button>
        }
      />

      <div className="card animate-fade-in-up">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Carregando agenda...</div>
        ) : appointments.length > 0 ? (
          <DataTable columns={appointmentColumns} data={appointments} />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon"><CalendarDays size={28} /></div>
            <div className="empty-state__title">Nenhuma consulta agendada</div>
            <div className="empty-state__text">Clique em "Nova Consulta" para organizar seu dia.</div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Agendamento</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select name="patient_id" className="form-input" required>
                  <option value="">Selecione um paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data e Hora</label>
                <input type="datetime-local" name="date" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo / Notas</label>
                <input type="text" name="notes" className="form-input" placeholder="Ex: Avaliação Inicial, Retorno..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
