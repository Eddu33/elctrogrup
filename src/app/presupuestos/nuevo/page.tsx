'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Package,
  Wrench,
  DollarSign,
  TrendingUp,
  User,
  ArrowLeft,
  Check,
  Search,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { formatARS, formatUSD } from '@/lib/utils';

function NuevoPresupuestoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<any[]>([]);
  const [materialsCatalog, setMaterialsCatalog] = useState<any[]>([]);
  const [dollarRate, setDollarRate] = useState<number>(1250);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [obra, setObra] = useState('Sin obra');
  const [status, setStatus] = useState('Borrador');
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(15);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    'Presupuesto válido por 15 días corridos. Precios en pesos sujetos a variación del dólar oficial/blue.'
  );

  // Materials for this budget
  const [budgetMaterials, setBudgetMaterials] = useState<any[]>([
    {
      materialId: null,
      name: '',
      category: 'Protecciones',
      unit: 'unidad',
      quantity: 1,
      unitPriceUSD: 0,
      unitPriceARS: 0,
      subtotalARS: 0,
      notes: '',
    },
  ]);

  // Labor / Tasks for this budget
  const [budgetLabors, setBudgetLabors] = useState<any[]>([
    {
      description: 'Mano de obra y ejecución de trabajos eléctricos',
      quantity: 1,
      unit: 'global',
      unitPrice: 35000,
      subtotal: 35000,
    },
  ]);

  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);

  // Material selector modal or dropdown
  const [materialSearch, setMaterialSearch] = useState('');
  const [activeMaterialRowIndex, setActiveMaterialRowIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resConfig, resClients, resMaterials] = await Promise.all([
        fetch('/api/configuracion'),
        fetch('/api/clientes'),
        fetch('/api/materiales'),
      ]);

      if (resConfig.ok) {
        const config = await resConfig.json();
        if (config.dollarRate) setDollarRate(config.dollarRate);
        if (config.pdfFooterNotes) setTerms(config.pdfFooterNotes);
      }
      if (resClients.ok) {
        const cData = await resClients.json();
        setClients(cData);
        if (preselectedClientId) {
          const matched = cData.find((c: any) => c.id === preselectedClientId);
          if (matched) {
            setSelectedClientId(matched.id);
            setClientName(matched.name);
          }
        }
      }
      if (resMaterials.ok) {
        setMaterialsCatalog(await resMaterials.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (id: string) => {
    setSelectedClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientName(client.name);
    } else {
      setClientName('');
    }
  };

  // Add material item
  const handleAddMaterialRow = () => {
    setBudgetMaterials([
      ...budgetMaterials,
      {
        materialId: null,
        name: '',
        category: 'Varios',
        unit: 'unidad',
        quantity: 1,
        unitPriceUSD: 0,
        unitPriceARS: 0,
        subtotalARS: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    setBudgetMaterials(budgetMaterials.filter((_, i) => i !== index));
  };

  const handleSelectMaterialFromCatalog = (mat: any, index: number) => {
    const updated = [...budgetMaterials];
    const unitARS = mat.priceARS > 0 ? mat.priceARS : Math.round(mat.priceUSD * dollarRate);
    const qty = updated[index].quantity || 1;

    updated[index] = {
      ...updated[index],
      materialId: mat.id,
      name: mat.name,
      category: mat.category,
      unit: mat.unit,
      unitPriceUSD: mat.priceUSD,
      unitPriceARS: unitARS,
      subtotalARS: qty * unitARS,
    };
    setBudgetMaterials(updated);
    setActiveMaterialRowIndex(null);
  };

  const handleMaterialQuantityChange = (index: number, qtyStr: string) => {
    const qty = parseFloat(qtyStr) || 0;
    const updated = [...budgetMaterials];
    updated[index].quantity = qty;
    updated[index].subtotalARS = qty * (updated[index].unitPriceARS || 0);
    setBudgetMaterials(updated);
  };

  const handleMaterialPriceChange = (index: number, priceStr: string) => {
    const priceARS = parseFloat(priceStr) || 0;
    const updated = [...budgetMaterials];
    updated[index].unitPriceARS = priceARS;
    updated[index].unitPriceUSD = Number((priceARS / dollarRate).toFixed(2));
    updated[index].subtotalARS = (updated[index].quantity || 1) * priceARS;
    setBudgetMaterials(updated);
  };

  const handleMaterialNotesChange = (index: number, notesStr: string) => {
    const updated = [...budgetMaterials];
    updated[index].notes = notesStr;
    setBudgetMaterials(updated);
  };

  // Add labor item
  const handleAddLaborRow = () => {
    setBudgetLabors([
      ...budgetLabors,
      {
        description: '',
        quantity: 1,
        unit: 'global',
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveLaborRow = (index: number) => {
    setBudgetLabors(budgetLabors.filter((_, i) => i !== index));
  };

  const handleLaborChange = (index: number, field: string, val: any) => {
    const updated = [...budgetLabors];
    updated[index][field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(updated[index].quantity) || 0;
      const p = parseFloat(updated[index].unitPrice) || 0;
      updated[index].subtotal = q * p;
    }
    setBudgetLabors(updated);
  };

  // Subtotals and totals
  const subtotalMaterials = budgetMaterials.reduce((acc, m) => acc + (m.subtotalARS || 0), 0);
  const subtotalLabor = budgetLabors.reduce((acc, l) => acc + (l.subtotal || 0), 0);
  const subtotalGeneral = subtotalMaterials + subtotalLabor;
  const discountAmount = subtotalGeneral * ((discountPercent || 0) / 100);
  const taxableAmount = subtotalGeneral - discountAmount;
  const taxAmount = taxableAmount * ((taxPercent || 0) / 100);
  const totalGeneral = taxableAmount + taxAmount;
  const totalUSD = totalGeneral / (dollarRate || 1);

  // Save budget
  const handleSaveBudget = async () => {
    if (!title.trim()) {
      alert('Por favor ingrese un título para el presupuesto (ej: "chequeo de seguridad eléctrica")');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        obra,
        status,
        clientId: selectedClientId || null,
        clientName: clientName || null,
        date,
        validityDays,
        dollarRate,
        notes,
        terms,
        materials: budgetMaterials.filter((m) => m.name.trim() !== ''),
        labors: budgetLabors.filter((l) => l.description.trim() !== ''),
        discountPercent,
        taxPercent,
      };

      const res = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/presupuestos/${created.id}`);
      } else {
        const err = await res.json();
        alert(`Error al guardar: ${err.error || 'Ocurrió un error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar presupuesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/presupuestos"
            className="p-2 rounded-lg bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Nuevo Presupuesto
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Creá una cotización completa con cálculo de materiales en dólares y mano de obra.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveBudget}
          disabled={saving}
          className="px-6 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-extrabold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saving ? 'Guardando...' : 'Crear y Guardar'}</span>
        </button>
      </div>

      {/* Card 1: General Details */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2 border-b pb-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Información General del Trabajo</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Título del Presupuesto / Trabajo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: chequeo de seguridad eléctrica"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Obra / Proyecto
            </label>
            <input
              type="text"
              value={obra}
              onChange={(e) => setObra(e.target.value)}
              placeholder="Sin obra"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Cliente
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="">-- Seleccionar de Agenda --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nombre de Cliente (Libre)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre particular..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Fecha de Emisión
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="Borrador">Borrador</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Dollar rate for this budget */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-900">
            <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Cotización fijada para este presupuesto:</strong> Los materiales seleccionados se calculan al cambio actual.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-neutral-700">1 USD =</span>
            <div className="relative w-32">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center font-bold text-neutral-500">
                $
              </span>
              <input
                type="number"
                value={dollarRate}
                onChange={(e) => {
                  const newR = parseFloat(e.target.value) || 1;
                  setDollarRate(newR);
                  // Recalculate material prices
                  const updated = budgetMaterials.map((m) => {
                    const unitARS = m.unitPriceUSD > 0 ? Math.round(m.unitPriceUSD * newR) : m.unitPriceARS;
                    return {
                      ...m,
                      unitPriceARS: unitARS,
                      subtotalARS: (m.quantity || 1) * unitARS,
                    };
                  });
                  setBudgetMaterials(updated);
                }}
                className="w-full pl-6 pr-2 py-1.5 border border-neutral-300 rounded-lg font-bold text-neutral-900 bg-white"
              />
            </div>
            <span className="text-neutral-500 font-medium">ARS</span>
          </div>
        </div>
      </div>

      {/* Card 2: Materials per Job (Requested feature) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Lista de Materiales que se Utilizan por Trabajo</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Elegí materiales de tu catálogo o agregá específicos para esta obra.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddMaterialRow}
            className="px-3.5 py-1.5 bg-[#fef08a] hover:bg-[#fde047] text-neutral-900 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Agregar Material</span>
          </button>
        </div>

        {/* Materials Table */}
        <div className="space-y-3">
          {budgetMaterials.map((item, index) => (
            <div
              key={index}
              className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Material picker / Name */}
                <div className="md:col-span-5 relative">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Material / Insumo
                  </label>
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...budgetMaterials];
                        updated[index].name = e.target.value;
                        setBudgetMaterials(updated);
                      }}
                      placeholder="Seleccionar del catálogo o escribir..."
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMaterialRowIndex(
                          activeMaterialRowIndex === index ? null : index
                        )
                      }
                      className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs font-bold whitespace-nowrap"
                      title="Abrir buscador de catálogo"
                    >
                      Catálogo ▾
                    </button>
                  </div>

                  {/* Dropdown catalog finder */}
                  {activeMaterialRowIndex === index && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-xl p-3 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        placeholder="Buscar en catálogo..."
                        className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs mb-2"
                        autoFocus
                      />
                      <div className="divide-y divide-neutral-100">
                        {materialsCatalog
                          .filter((m) =>
                            m.name.toLowerCase().includes(materialSearch.toLowerCase())
                          )
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectMaterialFromCatalog(m, index)}
                              className="w-full text-left py-1.5 px-2 hover:bg-amber-50 rounded text-xs flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-neutral-900">{m.name}</div>
                                <span className="text-[10px] text-neutral-500">
                                  {m.category} · {m.unit}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-amber-800">
                                  ${m.priceARS > 0 ? m.priceARS : Math.round(m.priceUSD * dollarRate)}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  USD {m.priceUSD}
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Cantidad ({item.unit || 'u'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleMaterialQuantityChange(index, e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 bg-white"
                  />
                </div>

                {/* Unit Price ARS */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Precio Unit. ARS
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.unitPriceARS}
                    onChange={(e) => handleMaterialPriceChange(index, e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 bg-white"
                  />
                </div>

                {/* Subtotal ARS */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Subtotal ARS
                  </label>
                  <div className="px-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-extrabold text-neutral-900 text-right">
                    $ {Math.round(item.subtotalARS || 0).toLocaleString('es-AR')}
                  </div>
                </div>

                {/* Remove button */}
                <div className="md:col-span-1 text-center pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterialRow(index)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Quitar item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note / application for this material */}
              <div>
                <input
                  type="text"
                  value={item.notes || ''}
                  onChange={(e) => handleMaterialNotesChange(index, e.target.value)}
                  placeholder="Detalle o uso (Ej: 'Reemplazo de térmica desgastada')"
                  className="w-full px-3 py-1 text-[11px] text-neutral-600 border border-neutral-200 rounded-md bg-white focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 text-sm font-bold text-neutral-800">
          <span>Subtotal Materiales:&nbsp;</span>
          <span className="text-neutral-950 font-black">
            $ {Math.round(subtotalMaterials).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Card 3: Labor / Tasks */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Mano de Obra y Tareas a Realizar</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Detalle de horas, bocas o precio global de instalación.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddLaborRow}
            className="px-3.5 py-1.5 bg-[#fef08a] hover:bg-[#fde047] text-neutral-900 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Agregar Tarea</span>
          </button>
        </div>

        <div className="space-y-3">
          {budgetLabors.map((labor, index) => (
            <div
              key={index}
              className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              <div className="md:col-span-5">
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Descripción del Trabajo
                </label>
                <input
                  type="text"
                  value={labor.description}
                  onChange={(e) => handleLaborChange(index, 'description', e.target.value)}
                  placeholder="Ej: Montaje y cableado de tablero seccional"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Unidad
                </label>
                <select
                  value={labor.unit}
                  onChange={(e) => handleLaborChange(index, 'unit', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 bg-white"
                >
                  <option value="global">Global</option>
                  <option value="bocas">Bocas</option>
                  <option value="horas">Horas</option>
                  <option value="metros">Metros</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={labor.quantity}
                  onChange={(e) => handleLaborChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Precio Unit. ARS
                </label>
                <input
                  type="number"
                  step="100"
                  value={labor.unitPrice}
                  onChange={(e) => handleLaborChange(index, 'unitPrice', e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900 bg-white"
                />
              </div>

              <div className="md:col-span-1 text-center pt-5">
                <button
                  type="button"
                  onClick={() => handleRemoveLaborRow(index)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Quitar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 text-sm font-bold text-neutral-800">
          <span>Subtotal Mano de Obra:&nbsp;</span>
          <span className="text-neutral-950 font-black">
            $ {Math.round(subtotalLabor).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Card 4: Totals and Terms */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Términos y Condiciones del Presupuesto
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Notas privadas / Observaciones
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas internas para el instalador..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 space-y-3">
            <h4 className="font-extrabold text-sm text-neutral-900 uppercase tracking-wider border-b pb-2">
              Resumen de Liquidación
            </h4>

            <div className="flex justify-between text-xs text-neutral-600">
              <span>Subtotal Materiales:</span>
              <span className="font-bold text-neutral-900">
                $ {Math.round(subtotalMaterials).toLocaleString('es-AR')}
              </span>
            </div>

            <div className="flex justify-between text-xs text-neutral-600">
              <span>Subtotal Mano de Obra:</span>
              <span className="font-bold text-neutral-900">
                $ {Math.round(subtotalLabor).toLocaleString('es-AR')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-neutral-300 rounded text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600">
                  IVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-neutral-300 rounded text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between">
              <div>
                <div className="text-xs uppercase font-extrabold text-neutral-500">
                  TOTAL GENERAL
                </div>
                <div className="text-[11px] text-neutral-400">
                  Equiv. USD ${(totalUSD).toFixed(2)}
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-950">
                $ {Math.round(totalGeneral).toLocaleString('es-AR')}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleSaveBudget}
            disabled={saving}
            className="px-8 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-black rounded-xl text-sm shadow-md transition-transform active:scale-95 flex items-center space-x-2"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{saving ? 'Guardando en la nube...' : 'Guardar Presupuesto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NuevoPresupuestoPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Cargando formulario...</div>}>
      <NuevoPresupuestoContent />
    </Suspense>
  );
}

