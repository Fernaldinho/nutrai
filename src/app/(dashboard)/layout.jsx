import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'Dashboard — NutriSaaS',
};

export default function DashboardLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}
