import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

function createPrisma() {
  // @ts-ignore
  return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
}

export async function GET(request: NextRequest) {
  const prisma = createPrisma();
  try {
    const url = new URL(request.url);
    const activoId = url.searchParams.get('activoId');

    const where: any = {};
    if (activoId) {
      where.activoId = parseInt(activoId);
    }

    const asignaciones = await prisma.asignacion.findMany({
      where,
      orderBy: { fechaInicio: 'desc' },
      include: {
        empleado: true,
        activo: true,
      },
    });
    return NextResponse.json(asignaciones);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = createPrisma();
  try {
    const { activoId, empleadoId, area } = await request.json();

    if (!activoId || (!empleadoId && !area)) {
      return NextResponse.json({ error: 'activoId and empleadoId or area are required' }, { status: 400 });
    }

    const activo = await prisma.activo.findUnique({
      where: { id: parseInt(activoId) },
    });
    if (!activo || activo.deleted) {
      return NextResponse.json({ error: 'Activo not found' }, { status: 404 });
    }

    let empleadoIdNumber: number | null = null;
    if (empleadoId) {
      const empleado = await prisma.empleado.findUnique({
        where: { id: parseInt(empleadoId) },
      });
      if (!empleado) {
        return NextResponse.json({ error: 'Empleado not found' }, { status: 404 });
      }
      empleadoIdNumber = parseInt(empleadoId);
    }

    // Desactivar asignaciones activas previas para el activo
    await prisma.asignacion.updateMany({
      where: { activoId: parseInt(activoId), activa: true },
      data: { activa: false, fechaFin: new Date() },
    });

    const asignacion = await prisma.asignacion.create({
      data: {
        activoId: parseInt(activoId),
        empleadoId: empleadoIdNumber,
        area: area ?? null,
        fechaInicio: new Date(),
        activa: true,
      },
      include: {
        empleado: true,
        activo: true,
      },
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
