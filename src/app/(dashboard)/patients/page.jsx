'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Link from 'next/link';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { patientService } from '@/services/patientService';
import { createPatient, deletePatient, updatePatient } from '@/app/actions/patients';

export default function PacientesPage() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Colunas da tabela
  const patientColumns = [
    { 
      key: 'name', 
      label: 'Nome',
      render: (val, item) => (
        <Link href={`/patients/${item.id}`} className="clickable-name">
          {val}
        </Link>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    {
      key: 'birth_date',
      label: 'Data de Nasc.',
      render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, item) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-icon" 
            title="Editar"
            onClick={() => {
              setEditingPatient(item);
              setIsEditModalOpen(true);
            }}
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-icon btn-icon--danger" 
            title="Excluir"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.listPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    const res = await deletePatient(id);
    if (res.success) fetchPatients();
    else alert('Erro ao excluir: ' + res.error);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await createPatient(formData);
    
    if (res.error) {
      alert('Erro: ' + res.error);
    } else {
      setIsModalOpen(false);
      fetchPatients();
    }
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await updatePatient(editingPatient.id, formData);
    
    if (res.error) {
      alert('Erro ao atualizar: ' + res.error);
    } else {
      setIsEditModalOpen(false);
      setEditingPatient(null);
      fetchPatients();
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle="Gerencie seus pacientes e acompanhe o progresso de cada um."
        breadcrumbs={['Dashboard', 'Pacientes']}
        actions={
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Paciente
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
            placeholder="Buscar paciente por nome, email ou telefone..."
            style={{ border: 'none', boxShadow: 'none', padding: '8px 0', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="card animate-fade-in-up animate-delay-1">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Carregando pacientes...</div>
        ) : filteredPatients.length > 0 ? (
          <DataTable columns={patientColumns} data={filteredPatients} />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon"><Users size={28} /></div>
            <div className="empty-state__title">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </div>
            <div className="empty-state__text">
              {searchTerm ? 'Tente mudar o termo da busca.' : 'Clique em "Novo Paciente" para começar.'}
            </div>
          </div>
        )}
      </div>

      {/* Modal - Novo Paciente */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cadastrar Novo Paciente</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="name" className="form-input" required placeholder="Ex: Maria Silva" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" placeholder="email@exemplo.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp/Telefone</label>
                  <input type="text" name="phone" className="form-input" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Data de Nascimento</label>
                <input type="date" name="birth_date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Observações (Opcional)</label>
                <textarea name="notes" className="form-input" rows="3" placeholder="Histórico breve, restrições..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Editar Paciente */}
      {isEditModalOpen && editingPatient && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Paciente</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="name" className="form-input" required defaultValue={editingPatient.name} placeholder="Ex: Maria Silva" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" defaultValue={editingPatient.email} placeholder="email@exemplo.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp/Telefone</label>
                  <input type="text" name="phone" className="form-input" defaultValue={editingPatient.phone} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Data de Nascimento</label>
                <input type="date" name="birth_date" className="form-input" defaultValue={editingPatient.birth_date ? new Date(editingPatient.birth_date).toISOString().split('T')[0] : ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea name="notes" className="form-input" rows="3" defaultValue={editingPatient.notes} placeholder="Histórico breve, restrições..."></textarea>
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
