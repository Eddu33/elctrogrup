import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        presupuestos: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, company, cuitDni, phone, email, address, city, notes } = body;

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(company !== undefined && { company: company?.trim() || null }),
        ...(cuitDni !== undefined && { cuitDni: cuitDni?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
