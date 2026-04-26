'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Empleado {
  id: number;
  nombre: string;
  email: string;
  cargo: string;
}

interface Asignacion {
  id: number;
  area: string | null;
  fechaInicio: Date;
  activa: boolean;
  empleado: Empleado | null;
}

interface Props {
  activoId: number;
  asignacion: Asignacion | null;
  empleados: Empleado[];
}

export default function AsignacionManager({ activoId, asignacion, empleados }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<'empleado' | 'area'>(asignacion?.empleado ? 'empleado' : 'area');
  const [empleadoId, setEmpleadoId] = useState(asignacion?.empleado?.id.toString() ?? '');
  const [area, setArea] = useState(asignacion?.area ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAssign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (tipo === 'empleado' && !empleadoId) {
      setMessage('Selecciona un empleado para asignar.');
      return;
    }

    if (tipo === 'area' && !area.trim()) {
      setMessage('Escribe el área a la que se asignará el activo.');
      return;
    }

    setLoading(true);
    setMessage('');

    const payload = {
      activoId,
      empleadoId: tipo === 'empleado' ? empleadoId : undefined,
      area: tipo === 'area' ? area.trim() : undefined,
    };

    const res = await fetch('/api/asignaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json();
      setMessage(errorData.error || 'No se pudo asignar el activo.');
      return;
    }

    setMessage('Asignación guardada correctamente.');
    router.refresh();
  };

  const handleUnassign = async () => {
    if (!asignacion) {
      return;
    }

    if (!confirm('¿Deseas desasignar este activo?')) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/asignaciones/${asignacion.id}`, {
      method: 'DELETE',
    });
    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json();
      setMessage(errorData.error || 'No se pudo desasignar el activo.');
      return;
    }

    setMessage('Activo desasignado correctamente.');
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={handleAssign} className="space-y-4">
        <div className="space-y-2">
          <label className="block font-medium">Tipo de asignación</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="tipoAsignacion"
                value="empleado"
                checked={tipo === 'empleado'}
                onChange={() => setTipo('empleado')}
                className="border"
              />
              Empleado
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="tipoAsignacion"
                value="area"
                checked={tipo === 'area'}
                onChange={() => setTipo('area')}
                className="border"
              />
              Área
            </label>
          </div>
        </div>

        {tipo === 'empleado' ? (
          <div>
            <label className="block font-medium mb-1">Empleado</label>
            <select
              value={empleadoId}
              onChange={(event) => setEmpleadoId(event.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecciona un empleado</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre} — {empleado.cargo}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block font-medium mb-1">Área</label>
            <input
              type="text"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Escribe el área asignada"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {asignacion ? 'Actualizar asignación' : 'Asignar activo'}
          </button>
          {asignacion && (
            <button
              type="button"
              onClick={handleUnassign}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Desasignar
            </button>
          )}
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
