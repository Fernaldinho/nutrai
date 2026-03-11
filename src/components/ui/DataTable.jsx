export default function DataTable({ columns, data, emptyMessage }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">{emptyMessage || 'Nenhum dado encontrado'}</div>
        <div className="empty-state__text">Os dados aparecerão aqui quando disponíveis.</div>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id || i}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
