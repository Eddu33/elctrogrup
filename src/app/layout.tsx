import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ELECTRO GROUP | Presupuestos y Catálogo de Materiales Eléctricos',
  description: 'Sistema integral de presupuestación, clientes y catálogo de materiales eléctricos con actualización automática de dólar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} ELECTRO GROUP — Tableros Realistas. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
