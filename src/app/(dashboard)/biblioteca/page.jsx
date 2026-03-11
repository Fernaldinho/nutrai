import PageHeader from '@/components/ui/PageHeader';
import { Library, Plus } from 'lucide-react';

export const metadata = {
  title: 'Biblioteca — NutriSaaS',
};

export default function BibliotecaPage() {
  return (
    <div>
      <PageHeader
        title="Biblioteca"
        subtitle="Acesse e gerencie seus materiais, receitas, planos alimentares e documentos."
        breadcrumbs={['Dashboard', 'Biblioteca']}
        actions={
          <button className="btn btn--primary">
            <Plus size={18} />
            Novo Material
          </button>
        }
      />

      <div className="card animate-fade-in-up">
        <div className="empty-state">
          <div className="empty-state__icon">
            <Library size={28} />
          </div>
          <div className="empty-state__title">Biblioteca de materiais</div>
          <div className="empty-state__text">
            Organize suas receitas, planos alimentares, orientações e materiais educativos em um só lugar. Este módulo será expandido em breve.
          </div>
        </div>
      </div>
    </div>
  );
}
