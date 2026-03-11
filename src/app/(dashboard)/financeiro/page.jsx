'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { DollarSign, Plus, Filter, Download, ArrowUpRight, TrendingUp } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { financialService } from '@/services/financialService';
import { patientService } from '@/services/patientService';
import { registerPayment, deletePayment } from '@/app/actions/financial';

export default function FinanceiroPage() {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentColumns = [
    {
      key: 'date',
      label: 'Data',
      render: (val) => new Date(val).toLocaleDateString('pt-BR')
    },
    { key: 'patient_name', label: 'Paciente' },
    { key: 'category', label: 'Categoria' },
    {
      key: 'amount',
      label: 'Valor',
      render: (val) => `R$ ${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge status-badge--${val === 'pago' ? 'success' : 'warning'}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
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
          Excluir
        </button>
      )
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsData, patientsData] = await Promise.all([
        financialService.listPayments(),
        patientService.listPatients()
      ]);

      setPayments(paymentsData.map(p => ({
        ...p,
        patient_name: p.patients?.name || 'Venda Avulsa'
      })));
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Excluir este registro financeiro?')) return;
    const res = await deletePayment(id);
    if (!res.error) fetchData();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const res = await registerPayment(formData);
    
    if (res.error) alert('Erro: ' + res.error);
    else {
      setIsModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const totalMonthly = payments
    .filter(p => p.status === 'pago' && new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle suas receitas e acompanhe a saúde financeira do seu consultório."
        breadcrumbs={['Dashboard', 'Financeiro']}
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn--outline">
              <Download size={18} />
              Exportar
            </button>
            <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Registrar Receita
            </button>
          </div>
        }
      />

      {/* Resumo Financeiro */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card animate-fade-in-up" style={{ padding: '20px', borderLeft: '4px solid var(--success-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>Faturamento Mensal</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success-500)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in-up">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados financeiros...</div>
        ) : payments.length > 0 ? (
          <DataTable columns={paymentColumns} data={payments} />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon"><DollarSign size={28} /></div>
            <div className="empty-state__title">Nenhum registro financeiro</div>
            <div className="empty-state__text">Cadastre seus primeiros pagamentos para começar a acompanhar seu lucro.</div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Registrar Pagamento</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Paciente (Vincular)</label>
                <select name="patient_id" className="form-input">
                  <option value="">Nenhum (Venda Avulsa)</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input type="number" step="0.01" name="amount" className="form-input" required placeholder="0,00" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input type="date" name="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input">
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input type="text" name="category" className="form-input" defaultValue="Consulta" placeholder="Ex: Avaliação, Retorno, Kit..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
