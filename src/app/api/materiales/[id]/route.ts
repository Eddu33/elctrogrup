import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: params.id },
    });
    if (!material) {
      return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
    }
    return NextResponse.json(material);
  } catch (error: any) {
    console.error('Error fetching material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, category, unit, priceUSD, priceARS, brand, code, description } = body;

    const pUSD = priceUSD !== undefined ? parseFloat(priceUSD) : undefined;
    let pARS = priceARS !== undefined ? parseFloat(priceARS) : undefined;

    // If USD was updated and ARS wasn't explicitly changed, recalculate ARS
    if (pUSD !== undefined && pARS === undefined) {
      const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
      const currentRate = settings?.dollarRate || 1250;
      pARS = Math.round(pUSD * currentRate);
    }

    const updated = await prisma.material.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(category !== undefined && { category }),
        ...(unit !== undefined && { unit }),
        ...(pUSD !== undefined && { priceUSD: pUSD }),
        ...(pARS !== undefined && { priceARS: pARS }),
        ...(brand !== undefined && { brand: brand?.trim() || null }),
        ...(code !== undefined && { code: code?.trim() || null }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.material.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
