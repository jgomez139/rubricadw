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
    const asignacion = await prisma.asignacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        activo: true,
        empleado: true,
      },
    });
    if (!asignacion) {
      return NextResponse.json({ error: 'Asignacion not found' }, { status: 404 });
    }
    return NextResponse.json(asignacion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    const { empleadoId, area } = await request.json();

    if (!empleadoId && !area) {
      return NextResponse.json({ error: 'Either empleadoId or area must be provided' }, { status: 400 });
    }

    // Check if empleado exists if provided
    if (empleadoId) {
      const empleado = await prisma.empleado.findUnique({
        where: { id: parseInt(empleadoId) },
      });
      if (!empleado) {
        return NextResponse.json({ error: 'Empleado not found' }, { status: 404 });
      }
    }

    const asignacion = await prisma.asignacion.update({
      where: { id: parseInt(id) },
      data: {
        empleadoId: empleadoId ? parseInt(empleadoId) : null,
        area: area || null,
      },
      include: {
        activo: true,
        empleado: true,
      },
    });
    return NextResponse.json(asignacion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    await prisma.asignacion.update({
      where: { id: parseInt(id) },
      data: { activa: false, fechaFin: new Date() },
    });
    return NextResponse.json({ message: 'Asignacion deactivated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
