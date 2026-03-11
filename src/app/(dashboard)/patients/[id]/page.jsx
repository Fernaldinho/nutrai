'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { User, Calendar, FileText, Plus, ArrowLeft, Trash2, Clock } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { createMedicalRecord, deleteMedicalRecord } from '@/app/actions/medical-records';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { patient, records } = await patientService.getPatientWithHistory(id);
      setPatient(patient);
      setRecords(records);
    } catch (error) {
      console.error('Erro ao buscar detalhes do paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    formData.append('patient_id', id);
    
    const res = await createMedicalRecord(formData);
    
    if (res.error) alert('Erro: ' + res.error);
    else {
      setIsModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Excluir este registro?')) return;
    const res = await deleteMedicalRecord(recordId, id);
    if (!res.error) fetchData();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados do paciente...</div>;
  if (!patient) return <div style={{ padding: '40px', textAlign: 'center' }}>Paciente não encontrado.</div>;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => router.back()} className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-500)' }}>
          <ArrowLeft size={16} /> Voltar para lista
        </button>
      </div>

      <PageHeader
        title={patient.name}
        subtitle={`Prontuário e Histórico do Paciente`}
        breadcrumbs={['Pacientes', patient.name]}
        actions={
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Registro
          </button>
        }
      />

      <div className="dashboard-grid">
        {/* Informações do Paciente */}
        <div className="card animate-fade-in-up">
          <div className="card__header">
            <h2 className="card__title">Informações Gerais</h2>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Email</p>
              <p style={{ fontWeight: '500' }}>{patient.email || 'Não informado'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Telefone</p>
              <p style={{ fontWeight: '500' }}>{patient.phone || 'Não informado'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Nascimento</p>
              <p style={{ fontWeight: '500' }}>{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}</p>
            </div>
            {patient.notes && (
              <div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Observações</p>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>{patient.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de Atendimentos */}
        <div className="card animate-fade-in-up animate-delay-1" style={{ gridColumn: 'span 2' }}>
          <div className="card__header">
            <h2 className="card__title">Histórico de Atendimentos</h2>
          </div>
          
          <div className="timeline">
            {records.length > 0 ? (
              records.map((record, index) => (
                <div key={record.id} className="timeline-item animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="timeline-date">
                        <Calendar size={14} style={{ marginRight: '4px' }} />
                        {new Date(record.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                      </span>
                      <button onClick={() => handleDeleteRecord(record.id)} className="btn-icon btn-icon--danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {record.diagnosis && (
                      <div style={{ marginBottom: '8px' }}>
                        <span className="status-badge status-badge--info" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-600)', border: '1px solid var(--primary-200)' }}>
                          {record.diagnosis}
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.925rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {record.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Nenhum histórico registrado para este paciente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Novo Registro */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Atendimento / Evolução</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddRecord}>
              <div className="form-group">
                <label className="form-label">Data do Atendimento</label>
                <input type="datetime-local" name="date" className="form-input" defaultValue={new Date().toISOString().slice(0, 16)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Diagnóstico / Título Rápido</label>
                <input type="text" name="diagnosis" className="form-input" placeholder="Ex: Avaliação Antropométrica, Retorno Mensal..." />
              </div>
              <div className="form-group">
                <label className="form-label">Evolução / Notas do Atendimento</label>
                <textarea name="content" className="form-input" rows="8" required placeholder="Descreva os detalhes do atendimento..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
