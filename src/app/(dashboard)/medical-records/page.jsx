'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services/patientService';
import { createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '@/app/actions/medical-records';

export default function ProntuariosPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecordsAndPatients = async () => {
    setLoading(true);
    try {
      const [recordsData, patientsData] = await Promise.all([
        medicalRecordService.listRecords(),
        patientService.listPatients()
      ]);
      setRecords(recordsData);
      setPatients(patientsData);
      setFilteredRecords(recordsData);
    } catch (error) {
      console.error('Erro ao buscar dados do diário:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordsAndPatients();
  }, []);

  useEffect(() => {
    const filtered = records.filter(r => 
      r.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const handleDelete = async (id, patientId) => {
    if (!confirm('Tem certeza que deseja excluir esta anotação do diário?')) return;
    const res = await deleteMedicalRecord(id, patientId);
    if (res.success) fetchRecordsAndPatients();
    else alert('Erro ao excluir: ' + res.error);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await createMedicalRecord(formData);
    
    if (res.error) {
      alert('Erro: ' + res.error);
    } else {
      setIsModalOpen(false);
      fetchRecordsAndPatients();
    }
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await updateMedicalRecord(editingRecord.id, formData);
    
    if (res.error) {
      alert('Erro ao atualizar: ' + res.error);
    } else {
      setIsEditModalOpen(false);
      setEditingRecord(null);
      fetchRecordsAndPatients();
    }
    setIsSubmitting(false);
  };

  const recordColumns = [
    { key: 'date', label: 'Data', render: (val) => new Date(val).toLocaleDateString('pt-BR') },
    { key: 'patients.name', label: 'Paciente', render: (_, item) => item.patients?.name || 'Desconhecido' },
    { key: 'diagnosis', label: 'Motivo / Título', render: (val) => val || '-' },
    { 
      key: 'content', 
      label: 'Anotação', 
      render: (val) => (
        <span style={{ 
          display: 'block', 
          maxWidth: '300px', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, item) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-icon" 
            title="Editar Anotação"
            onClick={() => {
              setEditingRecord(item);
              setIsEditModalOpen(true);
            }}
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-icon btn-icon--danger" 
            title="Excluir"
            onClick={() => handleDelete(item.id, item.patient_id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Diário dos Pacientes (Prontuários)"
        subtitle="Registre anotações e evoluções dos seus pacientes."
        breadcrumbs={['Dashboard', 'Diário']}
        actions={
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Nova Anotação
          </button>
        }
      />

      {/* Search bar */}
      <div className="card animate-fade-in-up" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar anotação por paciente, título ou conteúdo..."
            style={{ border: 'none', boxShadow: 'none', padding: '8px 0', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card animate-fade-in-up animate-delay-1">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Carregando diário...</div>
        ) : filteredRecords.length > 0 ? (
          <DataTable columns={recordColumns} data={filteredRecords} />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">
              <BookOpen size={28} />
            </div>
            <div className="empty-state__title">Nenhuma anotação encontrada</div>
            <div className="empty-state__text">
              {searchTerm 
                ? 'Nenhum registro corresponde a sua busca.' 
                : 'Clique em "Nova Anotação" para criar seu primeiro registro do diário.'}
            </div>
            {!searchTerm && (
              <button className="btn btn--primary" style={{ marginTop: '16px' }} onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Criar Anotação
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Nova Anotação */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Anotação no Diário</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select name="patient_id" className="form-input" required defaultValue="">
                  <option value="" disabled>Selecione um paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Data da Anotação</label>
                <input type="date" name="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="form-group">
                <label className="form-label">Título / Motivo (Opcional)</label>
                <input type="text" name="diagnosis" className="form-input" placeholder="Ex: Retorno 2, Avaliação inicial..." />
              </div>

              <div className="form-group">
                <label className="form-label">Anotações do Diário</label>
                <textarea name="content" className="form-input" rows="6" required placeholder="Escreva a evolução, feedback ou anotação de acompanhamento do paciente..."></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar no Diário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Editar Anotação */}
      {isEditModalOpen && editingRecord && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Anotação</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select name="patient_id" className="form-input" required defaultValue={editingRecord.patient_id}>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Data da Anotação</label>
                <input type="date" name="date" className="form-input" required defaultValue={editingRecord.date ? new Date(editingRecord.date).toISOString().split('T')[0] : ''} />
              </div>

              <div className="form-group">
                <label className="form-label">Título / Motivo (Opcional)</label>
                <input type="text" name="diagnosis" className="form-input" defaultValue={editingRecord.diagnosis} placeholder="Ex: Retorno 2, Avaliação inicial..." />
              </div>

              <div className="form-group">
                <label className="form-label">Anotações do Diário</label>
                <textarea name="content" className="form-input" rows="6" required defaultValue={editingRecord.content}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
