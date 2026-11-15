import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        materials: true,
        labors: true,
      },
    });

    if (!presupuesto) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(presupuesto);
  } catch (error: any) {
    console.error('Error fetching presupuesto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      materials,
      labors,
      discountPercent,
      taxPercent,
    } = body;

    // Recalculate if materials or labors are provided
    let updateData: any = {
      ...(title !== undefined && { title: title.trim() }),
      ...(obra !== undefined && { obra }),
      ...(status !== undefined && { status }),
      ...(clientId !== undefined && { clientId }),
      ...(clientName !== undefined && { clientName }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(validityDays !== undefined && { validityDays: parseInt(validityDays) || 15 }),
      ...(dollarRate !== undefined && { dollarRate: parseFloat(dollarRate) || 1250 }),
      ...(notes !== undefined && { notes }),
      ...(terms !== undefined && { terms }),
    };

    if (materials || labors) {
      // First delete existing child items
      if (materials) {
        await prisma.presupuestoMaterialItem.deleteMany({
          where: { presupuestoId: params.id },
        });

        let subtotalMaterials = 0;
        const materialItems = materials.map((m: any) => {
          const qty = parseFloat(m.quantity) || 1;
          const unitARS = parseFloat(m.unitPriceARS) || 0;
          const subtotal = qty * unitARS;
          subtotalMaterials += subtotal;
          return {
            presupuestoId: params.id,
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

        await prisma.presupuestoMaterialItem.createMany({
          data: materialItems,
        });

        updateData.subtotalMaterials = subtotalMaterials;
      }

      if (labors) {
        await prisma.presupuestoLaborItem.deleteMany({
          where: { presupuestoId: params.id },
        });

        let subtotalLabor = 0;
        const laborItems = labors.map((l: any) => {
          const qty = parseFloat(l.quantity) || 1;
          const unitPrice = parseFloat(l.unitPrice) || 0;
          const subtotal = qty * unitPrice;
          subtotalLabor += subtotal;
          return {
            presupuestoId: params.id,
            description: l.description || 'Mano de obra',
            quantity: qty,
            unit: l.unit || 'global',
            unitPrice: unitPrice,
            subtotal: subtotal,
          };
        });

        await prisma.presupuestoLaborItem.createMany({
          data: laborItems,
        });

        updateData.subtotalLabor = subtotalLabor;
      }

      // Fetch current to calculate total
      const current = await prisma.presupuesto.findUnique({
        where: { id: params.id },
      });

      const subMaterials = updateData.subtotalMaterials !== undefined ? updateData.subtotalMaterials : (current?.subtotalMaterials || 0);
      const subLabor = updateData.subtotalLabor !== undefined ? updateData.subtotalLabor : (current?.subtotalLabor || 0);
      const disc = discountPercent !== undefined ? parseFloat(discountPercent) : (current?.discountPercent || 0);
      const tax = taxPercent !== undefined ? parseFloat(taxPercent) : (current?.taxPercent || 0);

      const subGen = subMaterials + subLabor;
      const discAmt = subGen * (disc / 100);
      const taxable = subGen - discAmt;
      const taxAmt = taxable * (tax / 100);
      const total = taxable + taxAmt;

      updateData.discountPercent = disc;
      updateData.taxPercent = tax;
      updateData.total = total;
    }

    const updated = await prisma.presupuesto.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        materials: true,
        labors: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating presupuesto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.presupuesto.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting presupuesto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
