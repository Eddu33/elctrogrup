'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Users,
  Settings,
  Zap,
  Package,
  TrendingUp,
  RefreshCw,
  X,
  Check
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [dollarRate, setDollarRate] = useState<number>(1250);
  const [showDollarModal, setShowDollarModal] = useState(false);
  const [newRate, setNewRate] = useState<string>('1250');
  const [loadingRate, setLoadingRate] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [companyName, setCompanyName] = useState('ELECTRO GROUP');
  const [brandColor, setBrandColor] = useState('#EAB308');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/configuracion');
      if (res.ok) {
        const data = await res.json();
        if (data.dollarRate) {
          setDollarRate(data.dollarRate);
          setNewRate(data.dollarRate.toString());
        }
        if (data.companyName) setCompanyName(data.companyName);
        if (data.brandColor) setBrandColor(data.brandColor);
      }
    } catch {
      // offline fallback
    }
  };

  const handleUpdateDollar = async () => {
    const val = parseFloat(newRate);
    if (isNaN(val) || val <= 0) return;
    setLoadingRate(true);
    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dollarRate: val, updateMaterials: true }),
      });
      if (res.ok) {
        setDollarRate(val);
        setShowDollarModal(false);
        // Dispatch custom event to notify open pages
        window.dispatchEvent(new CustomEvent('dollarRateUpdated', { detail: val }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRate(false);
    }
  };

  const fetchLiveDolarBlue = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (res.ok) {
        const data = await res.json();
        if (data.venta) {
          setNewRate(data.venta.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching live dollar:', err);
    } finally {
      setLoadingRate(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/presupuestos', label: 'Mis Presupuestos', icon: FileText },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/materiales', label: 'Catálogo de Materiales', icon: Package },
    { href: '/configuracion', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      <header className="bg-[#0f1014] text-white border-b border-neutral-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand and Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#eab308] flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-semibold leading-none">
                  Tableros Realistas
                </span>
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#eab308] transition-colors leading-tight">
                  {companyName}
                </span>
              </div>
            </Link>

            {/* Desktop Nav items */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Tools & User Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Dollar Rate Badge / Action */}
            <button
              onClick={() => setShowDollarModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-800 rounded-md border border-neutral-700 text-xs font-semibold text-neutral-200 transition-all cursor-pointer"
              title="Click para cambiar cotización del dólar"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#eab308]" />
              <span>USD: ${dollarRate.toLocaleString('es-AR')}</span>
            </button>

            {/* Currency Selector matching screenshot "AR AR v" */}
            <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-medium text-neutral-300">
              <span>AR AR</span>
              <span className="text-[10px] text-neutral-500">▼</span>
            </div>

            {/* Mis herramientas link */}
            <Link
              href="/materiales"
              className="hidden lg:inline-flex text-xs font-semibold text-[#eab308] hover:underline"
            >
              Mis herramientas
            </Link>

            {/* Company text badge */}
            <span className="hidden sm:inline-block text-xs font-extrabold tracking-wide text-neutral-200 uppercase">
              {companyName}
            </span>

            {/* User Avatar Circle "EL" */}
            <div className="w-8 h-8 rounded-full bg-[#eab308] text-black font-extrabold text-xs flex items-center justify-center shadow-inner select-none cursor-pointer">
              EL
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-neutral-800 py-2 px-2 bg-[#121318]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2 rounded text-xs ${
                  isActive ? 'text-[#eab308] font-bold' : 'text-neutral-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Synchronized status bar matching screenshot */}
      <div className="bg-[#f3f4f6] border-b border-neutral-200 text-neutral-600 text-xs py-1.5 px-4 text-center sm:text-left flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Sincronizado con Neon PostgreSQL. Presupuestos y catálogo de materiales actualizados en la nube.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-neutral-500">
          <span>Dólar activo: <strong>${dollarRate} ARS</strong></span>
          <button
            onClick={() => setShowDollarModal(true)}
            className="text-amber-600 hover:text-amber-700 underline font-medium"
          >
            Modificar
          </button>
        </div>
      </div>

      {/* Modal to update Dollar Rate */}
      {showDollarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-neutral-800 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  $
                </div>
                <h3 className="font-bold text-lg text-neutral-900">
                  Actualizar Cotización del Dólar
                </h3>
              </div>
              <button
                onClick={() => setShowDollarModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4">
              Al modificar la cotización del dólar, todos los precios en pesos (ARS) de los materiales del catálogo y nuevos presupuestos se recalculan automáticamente.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cotización Dólar (ARS por USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="1250"
                    step="1"
                    className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-lg text-lg font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex items-center justify-between">
                <div className="text-xs text-amber-800">
                  <span className="font-semibold">¿Querés el Dólar Blue oficial?</span>
                  <p className="text-[11px] text-amber-700">Consulta la cotización actual en vivo de Argentina</p>
                </div>
                <button
                  type="button"
                  onClick={fetchLiveDolarBlue}
                  disabled={loadingRate}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRate ? 'animate-spin' : ''}`} />
                  <span>Obtener Blue</span>
                </button>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowDollarModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateDollar}
                  disabled={loadingRate}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 flex items-center space-x-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Aplicar y Recalcular</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
