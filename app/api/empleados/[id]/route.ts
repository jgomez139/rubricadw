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
    const empleado = await prisma.empleado.findUnique({
      where: { id: parseInt(id) },
    });
    if (!empleado) {
      return NextResponse.json({ error: 'Empleado not found' }, { status: 404 });
    }
    return NextResponse.json(empleado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    const { nombre, email, cargo } = await request.json();
    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: { nombre, email, cargo },
    });
    return NextResponse.json(empleado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = createPrisma();
  try {
    const { id } = await params;
    await prisma.empleado.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: 'Empleado deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
