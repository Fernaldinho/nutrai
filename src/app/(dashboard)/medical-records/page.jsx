import PageHeader from '@/components/ui/PageHeader';
import { BookOpen, Filter } from 'lucide-react';

export const metadata = {
  title: 'Prontuários — NutriSaaS',
};

export default function ProntuariosPage() {
  return (
    <div>
      <PageHeader
        title="Prontuários Médicos"
        subtitle="Acompanhe os históricos e registros de saúde dos seus pacientes."
        breadcrumbs={['Dashboard', 'Prontuários']}
        actions={
          <button className="btn btn--secondary">
            <Filter size={18} />
            Filtrar
          </button>
        }
      />

      <div className="card animate-fade-in-up">
        <div className="empty-state">
          <div className="empty-state__icon">
            <BookOpen size={28} />
          </div>
          <div className="empty-state__title">Prontuário eletrônico</div>
          <div className="empty-state__text">
            Visualize e gerencie os prontuários dos pacientes com históricos, diagnósticos e evoluções. Este módulo será expandido em breve.
          </div>
        </div>
      </div>
    </div>
  );
}
