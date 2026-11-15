'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Cloud,
  Search,
  User,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { formatARS, formatDate } from '@/lib/utils';

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedObra, setSelectedObra] = useState('Todas las obras');
  const [obrasList, setObrasList] = useState<string[]>(['Todas las obras']);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch('/api/presupuestos');
      if (res.ok) {
        const data = await res.json();
        setPresupuestos(data);

        // Extract unique obras
        const obras = Array.from(new Set(data.map((p: any) => p.obra || 'Sin obra')));
        setObrasList(['Todas las obras', ...obras as string[]]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/presupuestos/${id}/duplicar`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchPresupuestos();
      }
    } catch (err) {
      console.error('Error duplicating:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) return;
    try {
      const res = await fetch(`/api/presupuestos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPresupuestos(presupuestos.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Filtered list
  const filtered = presupuestos.filter((p) => {
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));

    const matchesObra =
      selectedObra === 'Todas las obras' || (p.obra || 'Sin obra') === selectedObra;

    return matchesSearch && matchesObra;
  });

  // Count without obra
  const sinObraCount = presupuestos.filter((p) => (p.obra || 'Sin obra') === 'Sin obra').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-[#fef08a] flex items-center justify-center text-amber-800">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
              Mis Presupuestos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Historial guardado para tu cuenta. Sincronizado en la nube (Neon PostgreSQL).
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchPresupuestos()}
            className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Cloud className="w-3.5 h-3.5 text-neutral-500" />
            <span>Restaurar Copia</span>
          </button>
          <Link
            href="/presupuestos/nuevo"
            className="px-5 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Nuevo</span>
          </Link>
        </div>
      </div>

      {/* Main Container matching Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o cliente..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 placeholder-neutral-400"
          />
        </div>

        {/* Filter Tabs matching Screenshot 1 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {obrasList.map((obra) => {
            const isSelected = selectedObra === obra;
            const count =
              obra === 'Todas las obras'
                ? presupuestos.length
                : obra === 'Sin obra'
                ? sinObraCount
                : presupuestos.filter((p) => p.obra === obra).length;

            return (
              <button
                key={obra}
                onClick={() => setSelectedObra(obra)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#fef08a] text-neutral-900 border border-amber-300/80 shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                <span>{obra}</span>
                {obra === 'Sin obra' && <span>· {sinObraCount}</span>}
              </button>
            );
          })}
        </div>

        {/* Budgets Grid matching Screenshot 1 Card layout */}
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Cargando presupuestos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
            No se encontraron presupuestos.
            <div className="mt-3">
              <Link
                href="/presupuestos/nuevo"
                className="inline-flex items-center px-4 py-2 text-xs font-bold bg-[#eab308] text-black rounded-lg"
              >
                Crear primer presupuesto
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Title & Date */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-1" title={p.title}>
                      {p.title}
                    </h3>
                    <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                      {formatDate(p.date || p.createdAt)}
                    </span>
                  </div>

                  {/* Client info */}
                  <div className="flex items-center space-x-1.5 text-xs text-neutral-500 mt-2">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-medium">
                      {p.client?.name || p.clientName || 'Sin cliente asignado'}
                    </span>
                  </div>

                  {/* Amount & Status Badge matching Screenshot 1 */}
                  <div className="flex items-center justify-between mt-3 pt-2">
                    <span className="text-base font-extrabold text-neutral-900">
                      $ {p.total.toLocaleString('es-AR')}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                        p.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Enviado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Actions "Abrir" "Duplicar" Trash matching Screenshot 1 */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/presupuestos/${p.id}`}
                      className="px-4 py-1.5 bg-[#fef9c3] hover:bg-[#fef08a] text-neutral-900 font-bold rounded-md transition-colors"
                    >
                      Abrir
                    </Link>
                    <button
                      onClick={(e) => handleDuplicate(p.id, e)}
                      className="px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-semibold rounded transition-colors"
                    >
                      Duplicar
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                    title="Eliminar presupuesto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
