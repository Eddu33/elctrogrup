import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const original = await prisma.presupuesto.findUnique({
      where: { id: params.id },
      include: {
        materials: true,
        labors: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Presupuesto original no encontrado' }, { status: 404 });
    }

    // Create a copy with status "Borrador" and title + " (Copia)"
    const duplicated = await prisma.presupuesto.create({
      data: {
        title: `${original.title} (Copia)`,
        obra: original.obra,
        status: 'Borrador',
        date: new Date(),
        validityDays: original.validityDays,
        dollarRate: original.dollarRate,
        clientId: original.clientId,
        clientName: original.clientName,
        notes: original.notes,
        terms: original.terms,
        subtotalMaterials: original.subtotalMaterials,
        subtotalLabor: original.subtotalLabor,
        discountPercent: original.discountPercent,
        taxPercent: original.taxPercent,
        total: original.total,
        materials: {
          create: original.materials.map((m) => ({
            materialId: m.materialId,
            name: m.name,
            category: m.category,
            unit: m.unit,
            quantity: m.quantity,
            unitPriceUSD: m.unitPriceUSD,
            unitPriceARS: m.unitPriceARS,
            subtotalARS: m.subtotalARS,
            notes: m.notes,
          })),
        },
        labors: {
          create: original.labors.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unit: l.unit,
            unitPrice: l.unitPrice,
            subtotal: l.subtotal,
          })),
        },
      },
      include: {
        client: true,
        materials: true,
        labors: true,
      },
    });

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating presupuesto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
