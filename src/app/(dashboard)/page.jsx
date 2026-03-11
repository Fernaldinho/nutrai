import { Users, CalendarDays, BookOpen, DollarSign, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import CalendarCard from '@/components/dashboard/CalendarCard';
import { createClient } from '@/lib/supabase-server';

function getGreeting(userName) {
  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 12) greeting = 'Bom dia';
  else if (hour < 18) greeting = 'Boa tarde';
  else greeting = 'Boa noite';
  
  return (
    <>
      {greeting}, <span>{userName}</span> 👋
    </>
  );
}

function getFormattedDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const consultaColumns = [
  { key: 'horario', label: 'Horário' },
  { key: 'paciente', label: 'Paciente' },
  { key: 'tipo', label: 'Tipo' },
  {
    key: 'status',
    label: 'Status',
    render: (val) => (
      <span className={`status-badge status-badge--${val === 'confirmado' || val === 'concluido' ? 'success' : val === 'pendente' ? 'warning' : 'danger'}`}>
        {val.charAt(0).toUpperCase() + val.slice(1)}
      </span>
    ),
  },
];

const diarioColumns = [
  { key: 'paciente', label: 'Paciente' },
  { key: 'data', label: 'Data' },
  { key: 'refeicoes', label: 'Refeições' },
  {
    key: 'kcal',
    label: 'Calorias',
    render: (val) => `${val.toLocaleString('pt-BR')} kcal`,
  },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Buscar Perfil (Lógica simples mantida aqui ou movida para userService se necessário)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user?.id)
    .single();

  const userName = profile?.name || user?.email?.split('@')[0] || 'Nutricionista';

  // 2. Buscar Estatísticas via Serviços (Adaptado para Server Side)
  // Nota: Para manter a performance do Promise.all, passamos o client
  const [
    { count: totalPatients },
    todayAppointments,
    monthlyRevenue,
    allAppointments
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('appointments')
      .select('*, patients(name)')
      .gte('date', new Date().toISOString().split('T')[0] + 'T00:00:00')
      .lte('date', new Date().toISOString().split('T')[0] + 'T23:59:59')
      .order('date', { ascending: true }),
    supabase.from('payments')
      .select('amount')
      .eq('status', 'pago')
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    supabase.from('appointments')
      .select('*, patients(name)')
      .order('date', { ascending: true })
  ]);

  const totalRevenue = monthlyRevenue?.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalAppointmentsToday = todayAppointments?.data?.length || 0;
  const pendingDiaries = 0; // Temporário até implementar a busca de diários

  const formattedAppointments = todayAppointments?.data?.map(app => ({
    id: app.id,
    paciente: app.patients?.name || 'Paciente Externo',
    horario: new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tipo: app.notes || 'Consulta',
    status: app.status
  })) || [];

  return (
    <div>
      {/* Greeting */}
      <div className="dashboard-greeting animate-fade-in-up">
        <h1 className="dashboard-greeting__hello">
          {getGreeting(userName)}
        </h1>
        <p className="dashboard-greeting__date">
          <Calendar size={15} />
          {getFormattedDate()}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total de Pacientes"
          value={totalPatients || '0'}
          badge={totalPatients > 0 ? "Ativos" : "Nenhum ainda"}
          badgeType="up"
          color="teal"
          href="/patients"
        />
        <StatCard
          icon={CalendarDays}
          label="Consultas Hoje"
          value={totalAppointmentsToday || '0'}
          badge="Próximos atendimentos"
          badgeType="up"
          color="blue"
          href="/agenda"
        />
        <StatCard
          icon={BookOpen}
          label="Diários Pendentes"
          value={pendingDiaries}
          badge="Avaliação necessária"
          badgeType="down"
          color="amber"
          href="/medical-records"
        />
        <StatCard
          icon={DollarSign}
          label="Receita Mensal"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          badge="Este mês"
          badgeType="up"
          color="green"
          href="/financeiro"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Agenda do Dia */}
          <div className="card animate-fade-in-up animate-delay-2">
            <div className="card__header">
              <h2 className="card__title">
                <Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary-500)' }} />
                Agenda de Hoje
              </h2>
              <Link href="/agenda" className="btn btn--sm btn--ghost" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: '600' }}>
                Ver agenda completa →
              </Link>
            </div>
            <DataTable 
              columns={consultaColumns} 
              data={formattedAppointments} 
              emptyMessage="Nenhuma consulta agendada para hoje."
            />
          </div>

          {/* Diários Recentes (Mock por enquanto) */}
          <div className="card animate-fade-in-up animate-delay-3">
            <div className="card__header">
              <h2 className="card__title">
                <BookOpen size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-500)' }} />
                Diários Recentes
              </h2>
              <Link href="/medical-records" className="btn btn--sm btn--ghost" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: '600' }}>
                Ver todos →
              </Link>
            </div>
            <DataTable 
              columns={diarioColumns} 
              data={[]} 
              emptyMessage="Nenhum diário foi enviado hoje."
            />
          </div>
        </div>

        {/* Coluna da Direita: Calendário */}
        <div className="animate-fade-in-up animate-delay-4">
          <CalendarCard appointments={allAppointments?.data || []} />
        </div>
      </div>
    </div>
  );
}
