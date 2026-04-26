import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // @ts-ignore
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  try {
    const { id } = await params;
    const { nombre, activo } = await request.json();
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nombre, activo },
    });
    return NextResponse.json(categoria);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // @ts-ignore
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  try {
    const { id } = await params;
    await prisma.categoria.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Categoria deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}