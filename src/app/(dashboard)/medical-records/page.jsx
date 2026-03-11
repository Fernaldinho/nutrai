'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { BookOpen, Plus, Search, Edit, Trash2, Heart, HeartOff, Compass, LayoutList, User } from 'lucide-react';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services/patientService';
import { createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '@/app/actions/medical-records';

export default function ProntuariosPage() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('Explorar'); // Explorar, Feed, Perfil
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [onlyReacted, setOnlyReacted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reactions (Mock local)
  const [reactedRecords, setReactedRecords] = useState(new Set());

  // Modals
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
    let result = [...records];

    // Filter by Tab (If Feed or Perfil and patient is selected)
    if ((activeTab === 'Feed' || activeTab === 'Perfil') && selectedPatientId) {
      result = result.filter(r => r.patient_id === selectedPatientId);
    }

    // Filter by Search term
    if (searchTerm) {
      result = result.filter(r => 
        r.patients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Reacted
    if (onlyReacted) {
      result = result.filter(r => reactedRecords.has(r.id));
    }

    setFilteredRecords(result);
  }, [searchTerm, records, activeTab, selectedPatientId, onlyReacted, reactedRecords]);

  const toggleReaction = (id) => {
    setReactedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

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

  return (
    <div>
      <PageHeader
        title="Diário dos Pacientes"
        subtitle="Mural de atualizações e registros em formato de rede social clínica."
        breadcrumbs={['Dashboard', 'Diário']}
        actions={
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Nova Anotação
          </button>
        }
      />

      {/* Navegação de Abas */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {[
          { id: 'Explorar', icon: Compass },
          { id: 'Feed', icon: LayoutList },
          { id: 'Perfil', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isActive ? 1 : 0.7
              }}
            >
              <Icon size={18} />
              {tab.id}
            </button>
          )
        })}
      </div>

      {/* Actions Bar: Filtros e Seletores */}
      <div className="card animate-fade-in-up" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search */}
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '12px' }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar anotação..."
            style={{ border: 'none', boxShadow: 'none', padding: '0', width: '100%', background: 'transparent' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Seletor de Paciente (apenas Feed e Perfil) */}
        {(activeTab === 'Feed' || activeTab === 'Perfil') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filtrar Paciente:</span>
            <select 
              className="form-input" 
              style={{ width: '200px', padding: '8px 12px', height: 'auto' }}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Todos os pacientes</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Toggle Apenas Reagidos */}
        <button 
          onClick={() => setOnlyReacted(!onlyReacted)}
          className={`btn ${onlyReacted ? 'btn--primary' : 'btn--outline'}`}
          style={{ padding: '8px 16px', height: 'auto', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '12px' }}
        >
          {onlyReacted ? <Heart size={16} fill="white" /> : <HeartOff size={16} />}
          Apenas Reagidos
        </button>

      </div>

      {/* FEED (Cards) */}
      <div className="animate-fade-in-up animate-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Carregando feed de evolução...</div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map(record => {
            const hasReacted = reactedRecords.has(record.id);
            return (
              <div key={record.id} className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '46px', height: '46px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))', 
                      color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: '700', fontSize: '16px' 
                    }}>
                      {record.patients?.name?.substring(0, 2).toUpperCase() || 'PA'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {record.patients?.name || 'Paciente Desconhecido'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                        {record.diagnosis && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary-600)', fontWeight: '500' }}>{record.diagnosis}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Icons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => { setEditingRecord(record); setIsEditModalOpen(true); }}
                      title="Editar anotação"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-icon--danger" 
                      onClick={() => handleDelete(record.id, record.patient_id)}
                      title="Apagar anotação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', paddingBottom: '16px' }}>
                  {record.content}
                </div>

                {/* Card Footer (Social actions) */}
                <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => toggleReaction(record.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
                      fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
                      color: hasReacted ? 'var(--danger-500)' : 'var(--text-tertiary)',
                    }}
                  >
                    <Heart size={18} fill={hasReacted ? 'var(--danger-500)' : 'none'} /> 
                    {hasReacted ? 'Reagido' : 'Reagir'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">
              <BookOpen size={28} />
            </div>
            <div className="empty-state__title">Nenhuma anotação encontrada</div>
            <div className="empty-state__text">
              Nenhum registro corresponde aos filtros atuais nesta aba.
            </div>
            {!searchTerm && !onlyReacted && (
              <button className="btn btn--primary" style={{ marginTop: '16px' }} onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Criar Anotação no Feed
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
              <h2 className="modal-title">Nova Evolução (Feed)</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select name="patient_id" className="form-input" required defaultValue={selectedPatientId || ''}>
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
                <label className="form-label">Tema / Título (Opcional)</label>
                <input type="text" name="diagnosis" className="form-input" placeholder="Ex: Avaliação quinzenal..." />
              </div>

              <div className="form-group">
                <label className="form-label">O que deseja compartilhar?</label>
                <textarea name="content" className="form-input" rows="6" required placeholder="Escreva o registro, evolução ou anotação do paciente..."></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Publicando...' : 'Publicar no Feed'}
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
              <h2 className="modal-title">Editar Evolução</h2>
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
                <label className="form-label">Data</label>
                <input type="date" name="date" className="form-input" required defaultValue={editingRecord.date ? new Date(editingRecord.date).toISOString().split('T')[0] : ''} />
              </div>

              <div className="form-group">
                <label className="form-label">Tema / Título (Opcional)</label>
                <input type="text" name="diagnosis" className="form-input" defaultValue={editingRecord.diagnosis} placeholder="Ex: Avaliação quinzenal..." />
              </div>

              <div className="form-group">
                <label className="form-label">Conteúdo</label>
                <textarea name="content" className="form-input" rows="6" required defaultValue={editingRecord.content}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Publicação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
