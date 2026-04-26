import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

function createPrisma() {
  // @ts-ignore
  return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
}

export async function GET() {
  const prisma = createPrisma();
  try {
    const empleados = await prisma.empleado.findMany({
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(empleados);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const prisma = createPrisma();
  try {
    const { nombre, email, cargo } = await request.json();
    if (!nombre || !email || !cargo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const empleado = await prisma.empleado.create({
      data: { nombre, email, cargo },
    });
    return NextResponse.json(empleado, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
