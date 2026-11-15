import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const obra = searchParams.get('obra');
    const status = searchParams.get('status');

    const where: any = {};
    if (obra && obra !== 'Todas las obras') {
      where.obra = obra;
    }
    if (status && status !== 'Todos') {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { obra: { contains: q, mode: 'insensitive' } },
        { clientName: { contains: q, mode: 'insensitive' } },
        { client: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const presupuestos = await prisma.presupuesto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        _count: {
          select: { materials: true, labors: true },
        },
      },
    });

    return NextResponse.json(presupuestos);
  } catch (error: any) {
    console.error('Error fetching presupuestos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      obra,
      status,
      clientId,
      clientName,
      date,
      validityDays,
      dollarRate,
      notes,
      terms,
      materials = [],
      labors = [],
      discountPercent = 0,
      taxPercent = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'El título del presupuesto es obligatorio' }, { status: 400 });
    }

    // Calculate subtotals
    let subtotalMaterials = 0;
    const materialItems = materials.map((m: any) => {
      const qty = parseFloat(m.quantity) || 1;
      const unitARS = parseFloat(m.unitPriceARS) || 0;
      const subtotal = qty * unitARS;
      subtotalMaterials += subtotal;
      return {
        materialId: m.materialId || null,
        name: m.name || 'Material',
        category: m.category || null,
        unit: m.unit || 'unidad',
        quantity: qty,
        unitPriceUSD: parseFloat(m.unitPriceUSD) || 0,
        unitPriceARS: unitARS,
        subtotalARS: subtotal,
        notes: m.notes || null,
      };
    });

    let subtotalLabor = 0;
    const laborItems = labors.map((l: any) => {
      const qty = parseFloat(l.quantity) || 1;
      const unitPrice = parseFloat(l.unitPrice) || 0;
      const subtotal = qty * unitPrice;
      subtotalLabor += subtotal;
      return {
        description: l.description || 'Mano de obra',
        quantity: qty,
        unit: l.unit || 'global',
        unitPrice: unitPrice,
        subtotal: subtotal,
      };
    });

    const subtotalGeneral = subtotalMaterials + subtotalLabor;
    const discountAmount = subtotalGeneral * ((parseFloat(discountPercent) || 0) / 100);
    const taxableAmount = subtotalGeneral - discountAmount;
    const taxAmount = taxableAmount * ((parseFloat(taxPercent) || 0) / 100);
    const total = taxableAmount + taxAmount;

    // Get client name if clientId provided
    let finalClientName = clientName;
    if (clientId && !finalClientName) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (client) finalClientName = client.name;
    }

    const presupuesto = await prisma.presupuesto.create({
      data: {
        title: title.trim(),
        obra: obra || 'Sin obra',
        status: status || 'Borrador',
        date: date ? new Date(date) : new Date(),
        validityDays: parseInt(validityDays) || 15,
        dollarRate: parseFloat(dollarRate) || 1250,
        clientId: clientId || null,
        clientName: finalClientName || null,
        notes: notes || null,
        terms: terms || null,
        subtotalMaterials,
        subtotalLabor,
        discountPercent: parseFloat(discountPercent) || 0,
        taxPercent: parseFloat(taxPercent) || 0,
        total,
        materials: {
          create: materialItems,
        },
        labors: {
          create: laborItems,
        },
      },
      include: {
        client: true,
        materials: true,
        labors: true,
      },
    });

    return NextResponse.json(presupuesto, { status: 201 });
  } catch (error: any) {
    console.error('Error creating presupuesto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
