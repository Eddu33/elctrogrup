import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { cuitDni: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { presupuestos: true },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, cuitDni, phone, email, address, city, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        cuitDni: cuitDni?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
