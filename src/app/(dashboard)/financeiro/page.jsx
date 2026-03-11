'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Clock, BarChart3 } from 'lucide-react';
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

  // Determinar o período dinâmico atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const periodString = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;

  const paymentColumns = [
    {
      key: 'date',
      label: 'Data',
      render: (val) => new Date(val).toLocaleDateString('pt-BR')
    },
    { key: 'patient_name', label: 'Beneficiário/Origem' },
    { key: 'category', label: 'Categoria' },
    {
      key: 'amount',
      label: 'Valor',
      render: (val) => {
        const num = parseFloat(val);
        const color = num < 0 ? 'var(--danger-500)' : 'var(--success-500)';
        return <span style={{ color, fontWeight: '500' }}>R$ {Math.abs(num).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
      }
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
          style={{ color: 'var(--danger-500)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}
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
        patient_name: p.patients?.name || (parseFloat(p.amount) < 0 ? 'Despesa Avulsa' : 'Receita Avulsa')
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
    if (!confirm('Excluir esta movimentação financeira?')) return;
    const res = await deletePayment(id);
    if (!res.error) fetchData();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    
    // Ajustar amount caso seja Saída
    const tipo = formData.get('tipo');
    let amountStr = formData.get('amount');
    let amountVal = parseFloat(amountStr.replace(',', '.'));
    
    if (tipo === 'saida') {
      amountVal = -Math.abs(amountVal);
    } else {
      amountVal = Math.abs(amountVal);
    }
    
    formData.set('amount', amountVal.toString());

    const res = await registerPayment(formData);
    
    if (res.error) alert('Erro: ' + res.error);
    else {
      setIsModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  // Cálculos do Resumo Financeiro (considerando período atual)
  const monthlyPayments = payments.filter(p => {
    const pd = new Date(p.date);
    return pd >= firstDay && pd <= lastDay;
  });

  const entradas = monthlyPayments.filter(p => p.status === 'pago' && parseFloat(p.amount) >= 0).reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const saidas = Math.abs(monthlyPayments.filter(p => p.status === 'pago' && parseFloat(p.amount) < 0).reduce((acc, curr) => acc + parseFloat(curr.amount), 0));
  const saldo = entradas - saidas;
  const aReceber = monthlyPayments.filter(p => p.status === 'pendente' && parseFloat(p.amount) >= 0).reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle suas receitas, despesas e acompanhe a saúde financeira."
        breadcrumbs={['Dashboard', 'Financeiro']}
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn--outline">
              <Download size={18} />
              Exportar
            </button>
            <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Nova movimentação
            </button>
          </div>
        }
      />

      {/* Período Selecionado */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Período selecionado:</span>
        <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {periodString}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card animate-fade-in-up animate-delay-1" style={{ padding: '20px', borderLeft: '4px solid var(--success-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>Entradas</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success-500)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="card animate-fade-in-up animate-delay-2" style={{ padding: '20px', borderLeft: '4px solid var(--danger-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>Saídas</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger-500)' }}>
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="card animate-fade-in-up animate-delay-3" style={{ padding: '20px', borderLeft: '4px solid var(--primary-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>Saldo</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '8px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', color: 'var(--primary-500)' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="card animate-fade-in-up animate-delay-4" style={{ padding: '20px', borderLeft: '4px solid var(--warning-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>A receber</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                R$ {aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--warning-500)' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Section */}
      <div className="card animate-fade-in-up" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary-500)' }} />
            Entradas x Saídas por período
          </h3>
        </div>
        
        {monthlyPayments.length > 0 ? (
          <div style={{ padding: '40px 20px', display: 'flex', gap: '40px', alignItems: 'flex-end', justifyContent: 'center', height: '200px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
             {/* Mock visual bem simples do gráfico baseado nas variáveis */}
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '60px', height: entradas === 0 ? '4px' : `${Math.max(20, (entradas / (entradas + saidas || 1)) * 100)}%`, background: 'var(--success-500)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
               <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Entradas</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '60px', height: saidas === 0 ? '4px' : `${Math.max(20, (saidas / (entradas + saidas || 1)) * 100)}%`, background: 'var(--danger-500)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
               <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Saídas</span>
             </div>
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)' }}>
            <p>Nenhum dado encontrado. Ainda não há movimentações no período selecionado.</p>
          </div>
        )}
      </div>

      {/* Tabela de Movimentações */}
      <div className="card animate-fade-in-up">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados financeiros...</div>
        ) : payments.length > 0 ? (
          <DataTable columns={paymentColumns} data={payments} />
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon"><DollarSign size={28} /></div>
            <div className="empty-state__title">Nenhuma movimentação registrada</div>
            <div className="empty-state__text">Clique em "Nova movimentação" para adicionar suas finanças.</div>
          </div>
        )}
      </div>

      {/* Modal Nova Movimentação */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Movimentação</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              
              <div className="form-group">
                <label className="form-label">Tipo da Movimentação</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" value="entrada" defaultChecked />
                    <span style={{ fontWeight: '500', color: 'var(--success-600)' }}>Entrada (Receita)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" value="saida" />
                    <span style={{ fontWeight: '500', color: 'var(--danger-600)' }}>Saída (Despesa)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Beneficiário/Origem (Opcional)</label>
                <select name="patient_id" className="form-input">
                  <option value="">Nenhum (Movimentação Avulsa)</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$)</label>
                <input type="number" step="0.01" min="0" name="amount" className="form-input" required placeholder="0.00" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input type="date" name="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input">
                    <option value="pago">Pago / Recebido</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Categoria / Descrição</label>
                <input type="text" name="category" className="form-input" defaultValue="Consulta" placeholder="Ex: Mensalidade, Ferramentas, Aluguel..." />
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
