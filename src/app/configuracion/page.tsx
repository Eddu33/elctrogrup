'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Upload,
  Check,
  Zap,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState({
    companyName: 'ELECTRO GROUP',
    ownerName: 'Pedro Espinosa Molina',
    cuitDni: '20-30405060-7',
    phone: '3512477860',
    email: 'contacto@electrogroup.com.ar',
    address: 'Córdoba, Argentina',
    brandColor: '#EAB308',
    logoUrl: '',
    dollarRate: 1250,
    pdfFooterNotes: 'Presupuesto válido por 15 días. Precios sujetos a variación del dólar.',
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updateMaterialsOnSave, setUpdateMaterialsOnSave] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/configuracion');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          companyName: data.companyName || 'ELECTRO GROUP',
          ownerName: data.ownerName || 'Pedro Espinosa Molina',
          cuitDni: data.cuitDni || '20-30405060-7',
          phone: data.phone || '3512477860',
          email: data.email || '',
          address: data.address || '',
          brandColor: data.brandColor || '#EAB308',
          logoUrl: data.logoUrl || '',
          dollarRate: data.dollarRate || 1250,
          pdfFooterNotes: data.pdfFooterNotes || 'Presupuesto válido por 15 días.',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          updateMaterials: updateMaterialsOnSave,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFetchBlue = async () => {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (res.ok) {
        const data = await res.json();
        if (data.venta) {
          setSettings({ ...settings, dollarRate: data.venta });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header section matching Screenshot 2 */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-[#fef08a] flex items-center justify-center text-amber-800 shadow-xs">
          <Briefcase className="w-6 h-6 text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Identidad y Contacto
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Estos datos se usarán en el encabezado de tus presupuestos oficiales.
          </p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Configuración e identidad guardada correctamente en la nube.</span>
        </div>
      )}

      {/* Main Form Container matching Screenshot 2 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Logo Corporativo matching Screenshot 2 */}
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Logo Corporativo</h3>
            <p className="text-xs text-neutral-500">
              Sube el logo de tu empresa (PNG o JPG). Aparecerá en la parte superior de tus presupuestos.
            </p>
          </div>

          <div className="flex items-center space-x-5">
            {/* Logo Preview matching Screenshot 2 */}
            <div className="w-24 h-24 rounded-xl border border-dashed border-neutral-300 bg-neutral-900 p-2 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
              <Zap className="w-6 h-6 text-[#eab308] fill-current mb-0.5" />
              <span className="text-[10px] font-black tracking-wider text-white uppercase leading-tight">
                {settings.companyName}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-700 flex items-center space-x-2 shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-500" />
                <span>Cargar Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setSettings({ ...settings, logoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, logoUrl: '' })}
                className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>

        {/* Color de la Marca matching Screenshot 2 */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Color de la Marca</h3>
            <p className="text-xs text-neutral-500">Elige el color principal para los PDFs.</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.brandColor}
              onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
              className="w-9 h-9 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={settings.brandColor}
              onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
              className="w-28 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold uppercase text-neutral-800"
            />
          </div>
        </div>

        {/* Form Fields matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-neutral-100">
          {/* Nombre de la Empresa / Marca */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>🏢</span>
              <span>Nombre de la Empresa / Marca</span>
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="ELECTRO GROUP"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Nombre del Titular */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>👤</span>
              <span>Nombre del Titular</span>
            </label>
            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
              placeholder="Pedro Espinosa Molina"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* CUIT / DNI */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>#</span>
              <span>CUIT / DNI</span>
            </label>
            <input
              type="text"
              value={settings.cuitDni}
              onChange={(e) => setSettings({ ...settings, cuitDni: e.target.value })}
              placeholder="Ej: 20-30405060-7"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Teléfono Comercial */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>📞</span>
              <span>Teléfono Comercial</span>
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="3512477860"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Email Comercial */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>✉️</span>
              <span>Email de Contacto</span>
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contacto@electrogroup.com.ar"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center space-x-1.5">
              <span>📍</span>
              <span>Dirección / Localidad</span>
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Córdoba, Argentina"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cotización Dólar Settings (Requested feature) */}
        <div className="bg-amber-50/70 rounded-xl p-5 border border-amber-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Cotización Dólar Base (ARS por USD)</span>
              </h4>
              <p className="text-xs text-neutral-600">
                Cada vez que modifiques este valor, podés actualizar automáticamente los precios en pesos de todo tu catálogo de materiales.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFetchBlue}
              className="self-start sm:self-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Traer Dólar Blue</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-bold">
                $
              </span>
              <input
                type="number"
                value={settings.dollarRate}
                onChange={(e) => setSettings({ ...settings, dollarRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg text-base font-bold text-neutral-900 bg-white"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs font-medium text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={updateMaterialsOnSave}
                onChange={(e) => setUpdateMaterialsOnSave(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>Recalcular precios de materiales del catálogo al guardar</span>
            </label>
          </div>
        </div>

        {/* Pie de página del PDF */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700">
            Términos y Condiciones para el pie del PDF
          </label>
          <textarea
            rows={2}
            value={settings.pdfFooterNotes}
            onChange={(e) => setSettings({ ...settings, pdfFooterNotes: e.target.value })}
            placeholder="Presupuesto válido por 15 días..."
            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          ></textarea>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-xl text-sm shadow-sm transition-transform active:scale-95 flex items-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
