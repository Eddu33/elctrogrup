'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Trash2,
  Copy,
  ArrowLeft,
  Check,
  User,
  Calendar,
  DollarSign,
  Package,
  Wrench,
  Clock,
  MessageCircle,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { formatARS, formatUSD, formatDate } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PresupuestoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<any | null>(null);
  const [companySettings, setCompanySettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    fetchPresupuestoAndSettings();
  }, [params.id]);

  const fetchPresupuestoAndSettings = async () => {
    try {
      const [resP, resS] = await Promise.all([
        fetch(`/api/presupuestos/${params.id}`),
        fetch('/api/configuracion'),
      ]);

      if (resP.ok) {
        setPresupuesto(await resP.json());
      }
      if (resS.ok) {
        setCompanySettings(await resS.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/presupuestos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPresupuesto({ ...presupuesto, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/presupuestos/${params.id}/duplicar`, {
        method: 'POST',
      });
      if (res.ok) {
        const copy = await res.json();
        router.push(`/presupuestos/${copy.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) return;
    try {
      const res = await fetch(`/api/presupuestos/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/presupuestos');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Professional PDF
  const handleGeneratePDF = () => {
    if (!presupuesto) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = companySettings?.brandColor || '#EAB308';
    const cName = companySettings?.companyName || 'ELECTRO GROUP';
    const oName = companySettings?.ownerName || 'Pedro Espinosa Molina';
    const cuit = companySettings?.cuitDni || '20-30405060-7';
    const tel = companySettings?.phone || '3512477860';
    const email = companySettings?.email || 'contacto@electrogroup.com.ar';
    const address = companySettings?.address || 'Córdoba, Argentina';

    // Header bar (Black banner)
    doc.setFillColor(15, 16, 20);
    doc.rect(0, 0, 210, 36, 'F');

    // Yellow accent stripe
    doc.setFillColor(234, 179, 8); // #eab308
    doc.rect(0, 36, 210, 2, 'F');

    // Company Title in Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(cName, 14, 15);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`Titular: ${oName}  |  CUIT: ${cuit}`, 14, 22);
    doc.text(`Tel: ${tel}  |  Email: ${email}  |  ${address}`, 14, 28);

    // Budget Number & Date in Header (Right side)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(234, 179, 8);
    doc.text(`PRESUPUESTO #${presupuesto.number || '1001'}`, 196, 15, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 220, 220);
    doc.text(`Fecha: ${formatDate(presupuesto.date || presupuesto.createdAt)}`, 196, 22, { align: 'right' });
    doc.text(`Validez: ${presupuesto.validityDays} días`, 196, 28, { align: 'right' });

    // Client and Work Info Box
    let curY = 44;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, curY, 182, 28, 2, 2, 'FD');

    doc.setTextColor(15, 16, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Trabajo: ${presupuesto.title}`, 18, curY + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const clientStr = presupuesto.client?.name || presupuesto.clientName || 'Cliente Particular';
    const clientPhone = presupuesto.client?.phone ? `  |  Tel: ${presupuesto.client.phone}` : '';
    const clientCuit = presupuesto.client?.cuitDni ? `  |  CUIT/DNI: ${presupuesto.client.cuitDni}` : '';
    doc.text(`Cliente: ${clientStr}${clientCuit}${clientPhone}`, 18, curY + 14);
    doc.text(`Obra / Ubicación: ${presupuesto.obra || 'Sin obra'}`, 18, curY + 20);

    // Dollar rate note
    doc.setTextColor(160, 110, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Cotización Dólar de referencia: $${presupuesto.dollarRate} ARS`, 192, curY + 20, { align: 'right' });

    curY += 34;

    // Table 1: Materials
    if (presupuesto.materials && presupuesto.materials.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 16, 20);
      doc.text('1. LISTA DE MATERIALES E INSUMOS ELÉCTRICOS', 14, curY);

      const matBody = presupuesto.materials.map((m: any, idx: number) => [
        (idx + 1).toString(),
        m.name + (m.notes ? `\n(${m.notes})` : ''),
        `${m.quantity} ${m.unit}`,
        `$ ${m.unitPriceARS.toLocaleString('es-AR')}`,
        `$ ${Math.round(m.subtotalARS).toLocaleString('es-AR')}`,
      ]);

      autoTable(doc, {
        startY: curY + 3,
        head: [['#', 'Material', 'Cant.', 'Precio Unit. (ARS)', 'Subtotal (ARS)']],
        body: matBody,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 16, 20],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 95 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 27, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Table 2: Labor
    if (presupuesto.labors && presupuesto.labors.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 16, 20);
      doc.text('2. MANO DE OBRA Y TAREAS DE INSTALACIÓN', 14, curY);

      const laborBody = presupuesto.labors.map((l: any, idx: number) => [
        (idx + 1).toString(),
        l.description,
        `${l.quantity} ${l.unit}`,
        `$ ${l.unitPrice.toLocaleString('es-AR')}`,
        `$ ${Math.round(l.subtotal).toLocaleString('es-AR')}`,
      ]);

      autoTable(doc, {
        startY: curY + 3,
        head: [['#', 'Descripción de Tarea', 'Cant.', 'Precio Unit. (ARS)', 'Subtotal (ARS)']],
        body: laborBody,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 16, 20],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 95 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 27, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      curY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Check if we need a new page for totals & footer
    if (curY > 230) {
      doc.addPage();
      curY = 20;
    }

    // Totals Box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(254, 252, 232); // amber-50
    doc.roundedRect(110, curY, 86, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text('Subtotal Materiales:', 115, curY + 6);
    doc.text(`$ ${Math.round(presupuesto.subtotalMaterials).toLocaleString('es-AR')}`, 192, curY + 6, { align: 'right' });

    doc.text('Subtotal Mano de Obra:', 115, curY + 12);
    doc.text(`$ ${Math.round(presupuesto.subtotalLabor).toLocaleString('es-AR')}`, 192, curY + 12, { align: 'right' });

    doc.setDrawColor(234, 179, 8);
    doc.line(115, curY + 16, 192, curY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 16, 20);
    doc.text('TOTAL:', 115, curY + 24);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`$ ${Math.round(presupuesto.total).toLocaleString('es-AR')}`, 192, curY + 24, { align: 'right' });

    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    const usdVal = (presupuesto.total / (presupuesto.dollarRate || 1)).toFixed(2);
    doc.text(`(Aprox. USD ${usdVal} @ $${presupuesto.dollarRate})`, 192, curY + 29, { align: 'right' });

    // Terms / Conditions on Left side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 16, 20);
    doc.text('Condiciones de Servicio:', 14, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    const termsLines = doc.splitTextToSize(
      presupuesto.terms ||
        'Presupuesto válido por 15 días corridos. Precios sujetos a variación del dólar oficial/blue.',
      90
    );
    doc.text(termsLines, 14, curY + 10);

    // Signatures at bottom
    curY += 45;
    if (curY > 260) {
      doc.addPage();
      curY = 30;
    }

    doc.setDrawColor(180, 180, 180);
    doc.line(25, curY, 80, curY);
    doc.line(130, curY, 185, curY);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Firma Instalador Responsable', 52.5, curY + 5, { align: 'center' });
    doc.text('Firma y Aclaración Cliente', 157.5, curY + 5, { align: 'center' });

    doc.save(`Presupuesto_${presupuesto.number || '1001'}_${presupuesto.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleWhatsAppShare = () => {
    if (!presupuesto) return;
    const phone = presupuesto.client?.phone?.replace(/\D/g, '') || '';
    const text = encodeURIComponent(
      `Hola ${presupuesto.client?.name || ''}! Te envío el presupuesto de *${companySettings?.companyName || 'ELECTRO GROUP'}* para el trabajo "*${presupuesto.title}*".\nTotal: *$ ${Math.round(presupuesto.total).toLocaleString('es-AR')}* (Validez: ${presupuesto.validityDays} días).\nQuedo a tu disposición ante cualquier consulta!`
    );
    window.open(`https://wa.me/549${phone}?text=${text}`, '_blank');
  };

  if (loading) {
    return <div className="p-16 text-center text-neutral-500">Cargando presupuesto...</div>;
  }

  if (!presupuesto) {
    return (
      <div className="p-16 text-center">
        <p className="text-neutral-500">Presupuesto no encontrado.</p>
        <Link href="/presupuestos" className="text-amber-600 font-bold mt-4 inline-block">
          Volver a Mis Presupuestos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/presupuestos"
            className="p-2 rounded-lg bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Presupuesto #{presupuesto.number || 1001}
              </span>
              <span className="text-xs text-neutral-500">
                {formatDate(presupuesto.date || presupuesto.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
              {presupuesto.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={presupuesto.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
              presupuesto.status === 'Aprobado'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : presupuesto.status === 'Enviado'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-neutral-100 text-neutral-800 border-neutral-300'
            }`}
          >
            <option value="Borrador">Borrador</option>
            <option value="Enviado">Enviado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>

          {/* PDF Button */}
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Descargar PDF</span>
          </button>

          {/* WhatsApp Button */}
          {presupuesto.client?.phone && (
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              title="Compartir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Shopping list button */}
          <button
            onClick={() => setShowShoppingList(!showShoppingList)}
            className="px-3 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 flex items-center space-x-1"
            title="Ver lista de compra de materiales"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Lista de Compras</span>
          </button>

          {/* Duplicate button */}
          <button
            onClick={handleDuplicate}
            className="p-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-700 transition-colors"
            title="Duplicar este presupuesto"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="p-2 bg-white hover:bg-red-50 border border-neutral-300 text-red-600 rounded-xl transition-colors"
            title="Eliminar presupuesto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shopping List Modal / Slide-down */}
      {showShoppingList && (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-amber-950 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-amber-700" />
              <span>Lista de Compras de Materiales para Distribuidora / Corralón</span>
            </h3>
            <button
              onClick={() => setShowShoppingList(false)}
              className="text-xs text-amber-800 underline font-semibold"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs text-amber-800">
            Copia esta lista o llevala para comprar los insumos exactos para esta obra:
          </p>
          <div className="bg-white rounded-xl p-4 border border-amber-200 divide-y divide-neutral-100 font-mono text-xs text-neutral-800">
            {presupuesto.materials.map((m: any, i: number) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{m.name}</span>
                  {m.notes && <span className="text-neutral-500 text-[11px] block">{m.notes}</span>}
                </div>
                <div className="font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded">
                  {m.quantity} {m.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Budget Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
          <div>
            <span className="text-neutral-400 font-semibold block uppercase text-[10px]">Cliente</span>
            <div className="font-bold text-sm text-neutral-900 mt-0.5">
              {presupuesto.client?.name || presupuesto.clientName || 'Particular'}
            </div>
            {presupuesto.client?.phone && (
              <div className="text-neutral-500 mt-0.5">Tel: {presupuesto.client.phone}</div>
            )}
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block uppercase text-[10px]">Obra / Proyecto</span>
            <div className="font-bold text-sm text-neutral-900 mt-0.5">
              {presupuesto.obra || 'Sin obra'}
            </div>
            <div className="text-neutral-500 mt-0.5">Validez: {presupuesto.validityDays} días</div>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block uppercase text-[10px]">Cotización Dólar Fijada</span>
            <div className="font-bold text-sm text-amber-700 mt-0.5">
              1 USD = ${presupuesto.dollarRate} ARS
            </div>
            <div className="text-neutral-500 mt-0.5">Equiv. Total: USD ${(presupuesto.total / presupuesto.dollarRate).toFixed(2)}</div>
          </div>
        </div>

        {/* Section 1: Materials */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span>Materiales e Insumos Eléctricos</span>
          </h3>

          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left text-xs text-neutral-800">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Material / Detalle</th>
                  <th className="py-2.5 px-3">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit. ARS</th>
                  <th className="py-2.5 px-3 text-right font-black">Subtotal ARS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {presupuesto.materials.map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-neutral-900">{m.name}</div>
                      {m.notes && <div className="text-[11px] text-neutral-500">{m.notes}</div>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {m.quantity} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                      $ {m.unitPriceARS.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-900 whitespace-nowrap">
                      $ {Math.round(m.subtotalARS).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right text-xs font-bold text-neutral-700">
            Subtotal Materiales: <span className="text-neutral-950 font-black text-sm">$ {Math.round(presupuesto.subtotalMaterials).toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Section 2: Labor */}
        {presupuesto.labors && presupuesto.labors.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Mano de Obra y Ejecución</span>
            </h3>

            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-left text-xs text-neutral-800">
                <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Tarea / Mano de Obra</th>
                    <th className="py-2.5 px-3">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Unit. ARS</th>
                    <th className="py-2.5 px-3 text-right font-black">Subtotal ARS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {presupuesto.labors.map((l: any, i: number) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {l.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {l.quantity} {l.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                        $ {l.unitPrice.toLocaleString('es-AR')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-neutral-900 whitespace-nowrap">
                        $ {Math.round(l.subtotal).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right text-xs font-bold text-neutral-700">
              Subtotal Mano de Obra: <span className="text-neutral-950 font-black text-sm">$ {Math.round(presupuesto.subtotalLabor).toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        {/* Section 3: Summary Totals */}
        <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-neutral-600 space-y-1">
            <div className="font-bold text-neutral-900">Términos y Condiciones:</div>
            <p className="max-w-md text-neutral-500">
              {presupuesto.terms || 'Presupuesto válido por 15 días corridos.'}
            </p>
          </div>

          <div className="text-right self-end sm:self-auto space-y-1">
            <span className="text-xs uppercase font-extrabold text-neutral-500">
              TOTAL PRESUPUESTADO
            </span>
            <div className="text-3xl font-black text-neutral-950">
              $ {Math.round(presupuesto.total).toLocaleString('es-AR')}
            </div>
            <div className="text-xs text-amber-800 font-semibold">
              Equivalente: USD ${(presupuesto.total / presupuesto.dollarRate).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
