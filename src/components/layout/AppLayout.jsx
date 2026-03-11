import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        {children}
      </main>
    </div>
  );
}
