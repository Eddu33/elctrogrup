import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: 'default',
          companyName: 'ELECTRO GROUP',
          ownerName: 'Pedro Espinosa Molina',
          cuitDni: '20-30405060-7',
          phone: '3512477860',
          email: 'contacto@electrogroup.com.ar',
          address: 'Córdoba, Argentina',
          brandColor: '#EAB308',
          dollarRate: 1250,
          dollarSource: 'blue',
          pdfFooterNotes: 'Presupuesto válido por 15 días. Precios sujetos a variación del dólar.',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      ownerName,
      cuitDni,
      phone,
      email,
      address,
      brandColor,
      logoUrl,
      dollarRate,
      dollarSource,
      pdfHeaderNotes,
      pdfFooterNotes,
      updateMaterials,
    } = body;

    const rateNum = dollarRate !== undefined ? parseFloat(dollarRate) : undefined;

    const settings = await prisma.companySettings.upsert({
      where: { id: 'default' },
      update: {
        ...(companyName !== undefined && { companyName }),
        ...(ownerName !== undefined && { ownerName }),
        ...(cuitDni !== undefined && { cuitDni }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(brandColor !== undefined && { brandColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(rateNum !== undefined && { dollarRate: rateNum }),
        ...(dollarSource !== undefined && { dollarSource }),
        ...(pdfHeaderNotes !== undefined && { pdfHeaderNotes }),
        ...(pdfFooterNotes !== undefined && { pdfFooterNotes }),
      },
      create: {
        id: 'default',
        companyName: companyName || 'ELECTRO GROUP',
        ownerName: ownerName || 'Pedro Espinosa Molina',
        cuitDni: cuitDni || '20-30405060-7',
        phone: phone || '3512477860',
        email: email || 'contacto@electrogroup.com.ar',
        address: address || 'Córdoba, Argentina',
        brandColor: brandColor || '#EAB308',
        dollarRate: rateNum || 1250,
        dollarSource: dollarSource || 'blue',
        pdfFooterNotes: pdfFooterNotes || 'Presupuesto válido por 15 días.',
      },
    });

    // If dollarRate changed and updateMaterials is true, recalculate all material ARS prices
    if (rateNum && updateMaterials) {
      const allMaterials = await prisma.material.findMany();
      for (const mat of allMaterials) {
        if (mat.priceUSD > 0) {
          const newPriceARS = Math.round(mat.priceUSD * rateNum);
          await prisma.material.update({
            where: { id: mat.id },
            data: { priceARS: newPriceARS },
          });
        }
      }
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
