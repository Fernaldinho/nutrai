import PageHeader from '@/components/ui/PageHeader';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Configurações — NutriSaaS',
};

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Personalize sua conta, preferências e configurações do sistema."
        breadcrumbs={['Dashboard', 'Configurações']}
      />

      <div className="card animate-fade-in-up">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Settings size={28} />
          </div>
          <div className="empty-state__title">Configurações do sistema</div>
          <div className="empty-state__text">
            Gerencie seu perfil, horários de atendimento, integrações e preferências do sistema. Este módulo será expandido em breve.
          </div>
        </div>
      </div>
    </div>
  );
}
