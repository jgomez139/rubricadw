import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

interface Props {
  params: {
    id: string;
  };
}

function createPrisma() {
  // @ts-ignore
  return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
}

function formatEstado(estado: string) {
  return estado.replace('_', ' ');
}

export default async function ActivoDetail({ params }: Props) {
  const prisma = createPrisma();
  const id = parseInt(params.id, 10);
  const activo = await prisma.activo.findUnique({
    where: { id },
    include: { categoria: true },
  });

  if (!activo || activo.deleted) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Detalle del Activo</h1>
        <Link href="/activos" className="bg-gray-800 text-white px-4 py-2 rounded">
          Volver a activos
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Información general</h2>
          <p><strong>Nombre:</strong> {activo.nombre}</p>
          <p><strong>Categoría:</strong> {activo.categoria.nombre}</p>
          <p><strong>Marca:</strong> {activo.marca}</p>
          <p><strong>Modelo:</strong> {activo.modelo}</p>
          <p><strong>Número de serie:</strong> {activo.serial}</p>
          <p><strong>Código de inventario:</strong> {activo.codigoInventario}</p>
          <p><strong>Estado:</strong> {formatEstado(activo.estado)}</p>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Detalles adicionales</h2>
          <p><strong>Fecha de compra:</strong> {new Date(activo.fechaCompra).toLocaleDateString()}</p>
          <p><strong>Costo:</strong> {activo.costo.toFixed(2)}</p>
          <p><strong>Proveedor:</strong> {activo.proveedor}</p>
          <p><strong>Creado:</strong> {new Date(activo.createdAt).toLocaleString()}</p>
          <p><strong>Última actualización:</strong> {new Date(activo.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
