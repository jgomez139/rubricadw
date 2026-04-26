import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

function createPrisma() {
  // @ts-ignore
  return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    const activo = await prisma.activo.findUnique({
      where: { id: parseInt(id) },
      include: { categoria: true },
    });
    if (!activo || activo.deleted) {
      return NextResponse.json({ error: 'Activo not found' }, { status: 404 });
    }
    return NextResponse.json(activo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    const { nombre, categoriaId, marca, modelo, serial, codigoInventario, estado, fechaCompra, costo, proveedor } = await request.json();
    const activo = await prisma.activo.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
        marca,
        modelo,
        serial,
        codigoInventario,
        estado,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : undefined,
        costo: costo ? parseFloat(costo) : undefined,
        proveedor,
      },
      include: { categoria: true },
    });
    return NextResponse.json(activo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    await prisma.activo.update({
      where: { id: parseInt(id) },
      data: { deleted: true },
    });
    return NextResponse.json({ message: 'Activo deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}