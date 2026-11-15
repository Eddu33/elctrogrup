import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    const where: any = {};
    if (category && category !== 'Todos') {
      where.category = category;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(materials);
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a bulk dollar recalculation request
    if (body.action === 'recalculate-dollar') {
      const dollarRate = parseFloat(body.dollarRate);
      if (isNaN(dollarRate) || dollarRate <= 0) {
        return NextResponse.json({ error: 'Cotización inválida' }, { status: 400 });
      }

      // Update settings
      await prisma.companySettings.upsert({
        where: { id: 'default' },
        update: { dollarRate },
        create: { id: 'default', dollarRate },
      });

      // Recalculate all materials
      const allMaterials = await prisma.material.findMany();
      for (const mat of allMaterials) {
        if (mat.priceUSD > 0) {
          const newPriceARS = Math.round(mat.priceUSD * dollarRate);
          await prisma.material.update({
            where: { id: mat.id },
            data: { priceARS: newPriceARS },
          });
        }
      }

      const updatedList = await prisma.material.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });

      return NextResponse.json({
        success: true,
        message: `Se actualizaron ${allMaterials.length} materiales a la cotización de $${dollarRate}`,
        materials: updatedList,
      });
    }

    // Otherwise create a single material
    const { name, category, unit, priceUSD, priceARS, brand, code, description } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const pUSD = parseFloat(priceUSD) || 0;
    let pARS = parseFloat(priceARS) || 0;

    // If USD is set but ARS not, get current dollar rate from settings
    if (pUSD > 0 && (!pARS || pARS === 0)) {
      const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
      const currentRate = settings?.dollarRate || 1250;
      pARS = Math.round(pUSD * currentRate);
    }

    const material = await prisma.material.create({
      data: {
        name: name.trim(),
        category: category || 'Varios',
        unit: unit || 'unidad',
        priceUSD: pUSD,
        priceARS: pARS,
        brand: brand?.trim() || null,
        code: code?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
