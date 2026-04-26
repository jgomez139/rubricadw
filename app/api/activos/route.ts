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
    const q = url.searchParams.get('q')?.trim() || '';
    const estado = url.searchParams.get('estado') || '';
    const categoriaId = url.searchParams.get('categoriaId');

    const where: any = { deleted: false };
    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId);
    }
    if (estado) {
      where.estado = estado;
    }
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { serial: { contains: q, mode: 'insensitive' } },
        { codigoInventario: { contains: q, mode: 'insensitive' } },
        { marca: { contains: q, mode: 'insensitive' } },
        { modelo: { contains: q, mode: 'insensitive' } },
      ];
    }

    const activos = await prisma.activo.findMany({
      where,
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(activos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = createPrisma();
  try {
    const { nombre, categoriaId, marca, modelo, serial, codigoInventario, estado, fechaCompra, costo, proveedor } = await request.json();
    if (!nombre || !categoriaId || !marca || !modelo || !serial || !codigoInventario) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const activo = await prisma.activo.create({
      data: {
        nombre,
        categoriaId: parseInt(categoriaId),
        marca,
        modelo,
        serial,
        codigoInventario,
        estado: estado || 'EN_BODEGA',
        fechaCompra: fechaCompra ? new Date(fechaCompra) : new Date(),
        costo: costo ? parseFloat(costo) : 0,
        proveedor: proveedor || '',
        deleted: false,
      },
      include: { categoria: true },
    });
    return NextResponse.json(activo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}