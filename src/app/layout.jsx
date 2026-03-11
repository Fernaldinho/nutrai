import '@/styles/globals.css';
import '@/styles/animations.css';

export const metadata = {
  title: 'NutriSaaS — Sistema para Nutricionistas',
  description: 'Plataforma moderna e completa para nutricionistas gerenciarem pacientes, consultas, diários alimentares e finanças.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
