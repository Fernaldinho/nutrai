import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <header className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="page-header__breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <ChevronRight size={14} className="page-header__breadcrumb-sep" />}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      )}
      <div className="page-header__top">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
