'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Settings,
  Package,
  Plus,
  ArrowRight,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { formatARS } from '@/lib/utils';

export default function HomePage() {
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [stats, setStats] = useState({
    borradores: 0,
    enviados: 0,
    aprobados: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch('/api/presupuestos');
      if (res.ok) {
        const data = await res.json();
        setPresupuestos(data);

        const borradores = data.filter((p: any) => p.status === 'Borrador').length;
        const enviados = data.filter((p: any) => p.status === 'Enviado').length;
        const aprobados = data.filter((p: any) => p.status === 'Aprobado').length;
        setStats({
          borradores,
          enviados,
          aprobados,
          total: data.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section matching Screenshot 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]">
            Presupuestá rápido.
            <br />
            <span className="text-[#eab308]">Cobrá mejor.</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl">
            Armá tu presupuesto en minutos con los precios de referencia y enviá un PDF profesional a tus clientes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/presupuestos/nuevo"
            className="px-6 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-transform active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo presupuesto</span>
          </Link>
          <Link
            href="/presupuestos"
            className="px-5 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-bold border border-neutral-300 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors text-xs uppercase tracking-wider"
          >
            <span>VER DEMO</span>
          </Link>
        </div>
      </div>

      {/* Resumen Bar matching Screenshot 3 */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-neutral-700">
          <span className="text-neutral-900 font-bold">Resumen</span>
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-700 rounded-full"
              style={{
                width: stats.total > 0 ? `${(stats.aprobados / stats.total) * 100}%` : '40%',
              }}
            ></div>
          </div>
          <span className="text-neutral-600 font-medium">
            {stats.borradores} borradores &nbsp;·&nbsp; {stats.enviados} enviados &nbsp;·&nbsp; {stats.aprobados} aprobados
          </span>
        </div>

        <Link
          href="/presupuestos"
          className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center space-x-1"
        >
          <span>Ver detalle</span>
          <span className="text-sm leading-none">↓</span>
        </Link>
      </div>

      {/* 4 Feature Action Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mi catálogo */}
        <Link
          href="/materiales"
          className="group bg-white rounded-xl p-4 border border-neutral-200 hover:border-amber-400 hover:shadow-md transition-all flex items-start space-x-3"
        >
          <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Mi catálogo</h3>
              <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">↗</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Tareas, materiales y precios</p>
          </div>
        </Link>

        {/* Presupuestos */}
        <Link
          href="/presupuestos"
          className="group bg-white rounded-xl p-4 border border-neutral-200 hover:border-amber-400 hover:shadow-md transition-all flex items-start space-x-3"
        >
          <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Presupuestos</h3>
              <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">↗</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Abrí, duplicá y organizá</p>
          </div>
        </Link>

        {/* Clientes */}
        <Link
          href="/clientes"
          className="group bg-white rounded-xl p-4 border border-neutral-200 hover:border-amber-400 hover:shadow-md transition-all flex items-start space-x-3"
        >
          <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Clientes</h3>
              <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">↗</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Tu agenda de contactos</p>
          </div>
        </Link>

        {/* Mi marca */}
        <Link
          href="/configuracion"
          className="group bg-white rounded-xl p-4 border border-neutral-200 hover:border-amber-400 hover:shadow-md transition-all flex items-start space-x-3"
        >
          <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
            <Settings className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Mi marca</h3>
              <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">↗</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Tus datos y estilo del PDF</p>
          </div>
        </Link>
      </div>

      {/* Últimos Presupuestos matching Screenshot 3 */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Últimos presupuestos</h2>
          <Link
            href="/presupuestos"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center space-x-1"
          >
            <span>Ver todos</span>
            <span>→</span>
          </Link>
        </div>

        <div className="divide-y divide-neutral-100">
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Cargando presupuestos...</div>
          ) : presupuestos.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              No hay presupuestos creados aún. Hacé click en "+ Nuevo presupuesto" para empezar.
            </div>
          ) : (
            presupuestos.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/presupuestos/${p.id}`}
                className="p-5 hover:bg-neutral-50/80 flex items-center justify-between transition-colors group block"
              >
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 group-hover:text-amber-600 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {p.client?.name || p.clientName || 'Cliente particular'}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="font-bold text-sm text-neutral-900">
                    ARS {p.total.toLocaleString('es-AR')}
                  </span>
                  <span
                    className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      p.status === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Enviado'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {p.status === 'Borrador' ? 'Borradores' : p.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
