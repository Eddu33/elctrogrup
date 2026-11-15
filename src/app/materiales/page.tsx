'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Check,
  Zap,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { formatARS, formatUSD } from '@/lib/utils';

export default function MaterialesPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [dollarRate, setDollarRate] = useState<number>(1250);
  const [inputRate, setInputRate] = useState<string>('1250');
  const [updatingDollar, setUpdatingDollar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cables',
    unit: 'unidad',
    priceUSD: '',
    priceARS: '',
    brand: '',
    code: '',
    description: '',
  });

  const categories = [
    'Todos',
    'Cables',
    'Protecciones',
    'Tableros',
    'Puesta a Tierra',
    'Cañerías y Cajas',
    'Módulos y Teclas',
    'Insumos',
    'Iluminación',
    'Varios',
  ];

  useEffect(() => {
    fetchSettingsAndMaterials();

    const handleDollarEvent = (e: any) => {
      if (e.detail) {
        setDollarRate(e.detail);
        setInputRate(e.detail.toString());
        fetchMaterials();
      }
    };
    window.addEventListener('dollarRateUpdated', handleDollarEvent);
    return () => window.removeEventListener('dollarRateUpdated', handleDollarEvent);
  }, []);

  const fetchSettingsAndMaterials = async () => {
    try {
      const resConfig = await fetch('/api/configuracion');
      if (resConfig.ok) {
        const config = await resConfig.json();
        if (config.dollarRate) {
          setDollarRate(config.dollarRate);
          setInputRate(config.dollarRate.toString());
        }
      }
      await fetchMaterials();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materiales');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk update dollar rate and recalculate all materials
  const handleRecalculateDollar = async () => {
    const rateNum = parseFloat(inputRate);
    if (isNaN(rateNum) || rateNum <= 0) return;

    setUpdatingDollar(true);
    try {
      const res = await fetch('/api/materiales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recalculate-dollar',
          dollarRate: rateNum,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDollarRate(rateNum);
        setMaterials(data.materials);
        setSuccessMessage(`¡Listo! Se actualizaron todos los precios en ARS a la cotización de $${rateNum}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDollar(false);
    }
  };

  const handleFetchLiveBlue = async () => {
    setUpdatingDollar(true);
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (res.ok) {
        const data = await res.json();
        if (data.venta) {
          setInputRate(data.venta.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDollar(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      category: 'Cables',
      unit: 'unidad',
      priceUSD: '',
      priceARS: '',
      brand: '',
      code: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMaterial(m);
    setFormData({
      name: m.name,
      category: m.category,
      unit: m.unit,
      priceUSD: m.priceUSD.toString(),
      priceARS: m.priceARS.toString(),
      brand: m.brand || '',
      code: m.code || '',
      description: m.description || '',
    });
    setShowModal(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingMaterial) {
        const res = await fetch(`/api/materiales/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchMaterials();
          setShowModal(false);
        }
      } else {
        const res = await fetch('/api/materiales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchMaterials();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Error saving material:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este material?')) return;
    try {
      const res = await fetch(`/api/materiales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMaterials(materials.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  // Sync USD <-> ARS in modal form
  const handleUSDChange = (usdVal: string) => {
    const val = parseFloat(usdVal) || 0;
    const calcARS = Math.round(val * dollarRate);
    setFormData({
      ...formData,
      priceUSD: usdVal,
      priceARS: calcARS > 0 ? calcARS.toString() : '',
    });
  };

  const handleARSChange = (arsVal: string) => {
    const val = parseFloat(arsVal) || 0;
    const calcUSD = Number((val / dollarRate).toFixed(2));
    setFormData({
      ...formData,
      priceARS: arsVal,
      priceUSD: calcUSD > 0 ? calcUSD.toString() : '',
    });
  };

  const filtered = materials.filter((m) => {
    const matchesCategory =
      selectedCategory === 'Todos' || m.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.code && m.code.toLowerCase().includes(q)) ||
      (m.brand && m.brand.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] flex items-center justify-center text-amber-800">
            <Package className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
              Catálogo de Materiales
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Materiales eléctricos normalizados con actualización en vivo por cotización del dólar.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nuevo Material</span>
        </button>
      </div>

      {/* Prominent Dollar Converter Control */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-neutral-50 rounded-2xl border-2 border-[#eab308]/40 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Actualización Inmediata por Cotización del Dólar</span>
              </h3>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl">
              Ingresá el valor del dólar actual. Al presionar "Actualizar", todos los precios en pesos (ARS) de los <strong>{materials.length} materiales</strong> se recalcularán automáticamente en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-44">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 font-bold text-sm">
                USD $
              </span>
              <input
                type="number"
                value={inputRate}
                onChange={(e) => setInputRate(e.target.value)}
                placeholder="1250"
                step="1"
                className="w-full pl-16 pr-3 py-2 border-2 border-amber-400/80 rounded-xl text-base font-black text-neutral-900 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleFetchLiveBlue}
              disabled={updatingDollar}
              type="button"
              className="px-3 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 flex items-center space-x-1 shadow-xs transition-colors"
              title="Obtener cotización del Dólar Blue en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${updatingDollar ? 'animate-spin' : ''}`} />
              <span>Traer Blue</span>
            </button>

            <button
              onClick={handleRecalculateDollar}
              disabled={updatingDollar}
              className="px-5 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-extrabold rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{updatingDollar ? 'Actualizando...' : 'Recalcular Precios'}</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-3 bg-emerald-100 border border-emerald-300 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-6">
        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código (SKU) o marca..."
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Categories pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'Todos'
                ? materials.length
                : materials.filter((m) => m.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#fef08a] text-neutral-900 border border-amber-300 shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] text-neutral-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Materials Table */}
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Cargando catálogo...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
            No se encontraron materiales con esos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left text-sm text-neutral-800">
              <thead className="bg-neutral-50 text-neutral-600 font-bold text-xs uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Material / Descripción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4 text-right">Precio USD</th>
                  <th className="py-3 px-4 text-right font-black text-amber-900 bg-amber-50/60">
                    Precio ARS (${dollarRate})
                  </th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-500 whitespace-nowrap">
                      {m.code || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      <div>{m.name}</div>
                      {m.brand && (
                        <div className="text-[11px] text-neutral-500 font-normal">
                          Marca: {m.brand}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600 capitalize">
                      {m.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-600 whitespace-nowrap">
                      {formatUSD(m.priceUSD)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-900 whitespace-nowrap bg-amber-50/40">
                      {formatARS(m.priceARS)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded transition-colors"
                          title="Editar material"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                          title="Eliminar material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Material */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-neutral-800 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-neutral-900">
                {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nombre del Material *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cable Unipolar 2.5 mm² Normalizado"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    {categories.filter((c) => c !== 'Todos').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="metro">Metro</option>
                    <option value="rollo">Rollo (100m / 25m)</option>
                    <option value="pack">Pack / Caja</option>
                    <option value="global">Global</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Precios sincronizados con Dólar (${dollarRate})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Precio en USD ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceUSD}
                      onChange={(e) => handleUSDChange(e.target.value)}
                      placeholder="Ej: 49.50"
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Precio en ARS ($ ARS)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.priceARS}
                      onChange={(e) => handleARSChange(e.target.value)}
                      placeholder="Ej: 61875"
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Schneider, Prysmian, Sica..."
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Código SKU / Referencia
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CAB-250"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 flex items-center space-x-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMaterial ? 'Guardar Cambios' : 'Crear Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
