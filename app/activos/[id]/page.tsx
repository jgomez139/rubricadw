import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import AsignacionManager from './AsignacionManager';

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
    include: {
      categoria: true,
      asignaciones: {
        include: { empleado: true },
        orderBy: { fechaInicio: 'desc' },
      },
    },
  });

  const empleados = await prisma.empleado.findMany({
    orderBy: { nombre: 'asc' },
  });

  if (!activo || activo.deleted) {
    notFound();
  }

  const activeAssignment = activo.asignaciones.find(a => a.activa) ?? null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Detalle del Activo</h1>
        <Link href="/activos" className="bg-gray-800 text-white px-4 py-2 rounded">
          Volver a activos
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-white p-4 rounded border lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Información general</h2>
          <p><strong>Nombre:</strong> {activo.nombre}</p>
          <p><strong>Categoría:</strong> {activo.categoria.nombre}</p>
          <p><strong>Marca:</strong> {activo.marca}</p>
          <p><strong>Modelo:</strong> {activo.modelo}</p>
          <p><strong>Número de serie:</strong> {activo.serial}</p>
          <p><strong>Código de inventario:</strong> {activo.codigoInventario}</p>
          <p><strong>Estado:</strong> {formatEstado(activo.estado)}</p>
          <div className="mt-4 bg-gray-50 p-4 rounded border">
            <h3 className="text-base font-semibold mb-2">Asignación actual</h3>
            {activeAssignment ? (
              <>
                <p>
                  <strong>Responsable:</strong>{' '}
                  {activeAssignment.empleado ? activeAssignment.empleado.nombre : activeAssignment.area ?? 'No disponible'}
                </p>
                {activeAssignment.empleado && (
                  <p><strong>Correo:</strong> {activeAssignment.empleado.email}</p>
                )}
                <p><strong>Fecha inicio:</strong> {new Date(activeAssignment.fechaInicio).toLocaleDateString()}</p>
              </>
            ) : (
              <p>No hay asignación activa para este activo.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Administrar asignación</h2>
          <AsignacionManager activoId={activo.id} asignacion={activeAssignment} empleados={empleados} />
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Detalles adicionales</h2>
          <p><strong>Fecha de compra:</strong> {new Date(activo.fechaCompra).toLocaleDateString()}</p>
          <p><strong>Costo:</strong> {activo.costo.toFixed(2)}</p>
          <p><strong>Proveedor:</strong> {activo.proveedor}</p>
          <p><strong>Creado:</strong> {new Date(activo.createdAt).toLocaleString()}</p>
          <p><strong>Última actualización:</strong> {new Date(activo.updatedAt).toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded border lg:col-span-3">
          <h2 className="text-lg font-semibold mb-2">Historial de asignaciones</h2>
          {activo.asignaciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Fecha inicio</th>
                    <th className="border p-2">Fecha fin</th>
                    <th className="border p-2">Responsable</th>
                    <th className="border p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activo.asignaciones.map((asignacion) => (
                    <tr key={asignacion.id} className="border hover:bg-gray-50">
                      <td className="border p-2">{new Date(asignacion.fechaInicio).toLocaleDateString()}</td>
                      <td className="border p-2">
                        {asignacion.fechaFin ? new Date(asignacion.fechaFin).toLocaleDateString() : '—'}
                      </td>
                      <td className="border p-2">
                        {asignacion.empleado ? asignacion.empleado.nombre : asignacion.area ?? 'No disponible'}
                      </td>
                      <td className="border p-2">
                        <span className={asignacion.activa ? 'text-green-600' : 'text-red-600'}>
                          {asignacion.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay asignaciones registradas para este activo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
