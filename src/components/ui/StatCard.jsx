import Link from 'next/link';

export default function StatCard({ icon: Icon, label, value, badge, badgeType, color, href }) {
  const colorMap = {
    teal: { bg: '#effefb', color: '#06c2ae' },
    blue: { bg: '#eff6ff', color: '#3b82f6' },
    amber: { bg: '#fffbeb', color: '#f59e0b' },
    green: { bg: '#ecfdf5', color: '#22c55e' },
    purple: { bg: '#faf5ff', color: '#a855f7' },
    rose: { bg: '#fff1f2', color: '#f43f5e' },
  };

  const c = colorMap[color] || colorMap.teal;

  const content = (
    <>
      <div className="stat-card__header">
        <div className="stat-card__icon">
          {Icon && <Icon size={22} />}
        </div>
        {badge && (
          <span className={`stat-card__badge stat-card__badge--${badgeType || 'up'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {href && (
        <div className="stat-card__footer" style={{ 
          marginTop: '16px', 
          paddingTop: '12px', 
          borderTop: '1px solid var(--border-light)', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <div className="btn btn--sm btn--ghost" style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--primary-600)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'var(--primary-50)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)'
          }}>
            Ver →
          </div>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="stat-card animate-fade-in-up"
        style={{ '--stat-bg': c.bg, '--stat-color': c.color, display: 'block', textDecoration: 'none' }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{ '--stat-bg': c.bg, '--stat-color': c.color }}
    >
      {content}
    </div>
  );
}
