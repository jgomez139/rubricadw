'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Activo {
  id: number;
  nombre: string;
  categoria: Categoria;
  marca: string;
  modelo: string;
  serial: string;
  codigoInventario: string;
  estado: string;
  fechaCompra: string;
  costo: number;
  proveedor: string;
  createdAt: string;
  updatedAt: string;
  asignaciones?: {
    id: number;
    area?: string;
    empleado?: {
      id: number;
      nombre: string;
      email: string;
      cargo: string;
    };
  }[];
}

export default function Activos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    categoriaId: '',
    marca: '',
    modelo: '',
    serial: '',
    codigoInventario: '',
    estado: 'EN_BODEGA',
    fechaCompra: '',
    costo: '',
    proveedor: '',
  });
  const [editing, setEditing] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategoriaId, setFilterCategoriaId] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    fetchActivos();
  }, [search, filterCategoriaId, filterEstado]);

  const fetchActivos = async () => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (filterCategoriaId) query.set('categoriaId', filterCategoriaId);
    if (filterEstado) query.set('estado', filterEstado);

    const res = await fetch(`/api/activos?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setActivos(data);
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  const fetchCategorias = async () => {
    const res = await fetch('/api/categorias');
    if (res.ok) {
      const data = await res.json();
      setCategorias(data.filter((c: Categoria) => c.activo));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/activos/${editing}` : '/api/activos';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      resetForm();
      fetchActivos();
    }
  };

  const handleEdit = (activo: Activo) => {
    setForm({
      nombre: activo.nombre,
      categoriaId: activo.categoria.id.toString(),
      marca: activo.marca,
      modelo: activo.modelo,
      serial: activo.serial,
      codigoInventario: activo.codigoInventario,
      estado: activo.estado,
      fechaCompra: activo.fechaCompra.split('T')[0],
      costo: activo.costo.toString(),
      proveedor: activo.proveedor,
    });
    setEditing(activo.id);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      nombre: '',
      categoriaId: '',
      marca: '',
      modelo: '',
      serial: '',
      codigoInventario: '',
      estado: 'EN_BODEGA',
      fechaCompra: '',
      costo: '',
      proveedor: '',
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este activo?')) {
      const res = await fetch(`/api/activos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchActivos();
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Activos Tecnológicos</h1>
        <button
          type="button"
          onClick={resetForm}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Nuevo Activo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar activos..."
          className="border p-2"
        />
        <select
          value={filterCategoriaId}
          onChange={(e) => setFilterCategoriaId(e.target.value)}
          className="border p-2"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="border p-2"
        >
          <option value="">Todos los estados</option>
          <option value="EN_USO">En Uso</option>
          <option value="EN_BODEGA">En Bodega</option>
          <option value="DADO_DE_BAJA">Dado de Baja</option>
          <option value="EN_REPARACION">En Reparación</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded">
        <h2 className="text-xl mb-2">{editing ? 'Editar Activo' : 'Crear Activo'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="border p-2"
            required
          />
          <select
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
            className="border p-2"
            required
          >
            <option value="">Seleccionar Categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Marca"
            value={form.marca}
            onChange={(e) => setForm({ ...form, marca: e.target.value })}
            className="border p-2"
            required
          />
          <input
            type="text"
            placeholder="Modelo"
            value={form.modelo}
            onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            className="border p-2"
            required
          />
          <input
            type="text"
            placeholder="Número de Serie"
            value={form.serial}
            onChange={(e) => setForm({ ...form, serial: e.target.value })}
            className="border p-2"
            required
          />
          <input
            type="text"
            placeholder="Código de Inventario"
            value={form.codigoInventario}
            onChange={(e) => setForm({ ...form, codigoInventario: e.target.value })}
            className="border p-2"
            required
          />
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="border p-2"
          >
            <option value="EN_USO">En Uso</option>
            <option value="EN_BODEGA">En Bodega</option>
            <option value="DADO_DE_BAJA">Dado de Baja</option>
            <option value="EN_REPARACION">En Reparación</option>
          </select>
          <input
            type="date"
            value={form.fechaCompra}
            onChange={(e) => setForm({ ...form, fechaCompra: e.target.value })}
            className="border p-2"
          />
          <input
            type="number"
            placeholder="Costo"
            value={form.costo}
            onChange={(e) => setForm({ ...form, costo: e.target.value })}
            className="border p-2"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Proveedor"
            value={form.proveedor}
            onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            className="border p-2"
          />
        </div>
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 mr-2 rounded">
            {editing ? 'Actualizar' : 'Crear'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Categoría</th>
              <th className="border p-2">Marca</th>
              <th className="border p-2">Modelo</th>
              <th className="border p-2">Serie</th>
              <th className="border p-2">Código</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Asignado</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.map((act) => (
              <tr key={act.id} className="border hover:bg-gray-50">
                <td className="border p-2">{act.nombre}</td>
                <td className="border p-2">{act.categoria.nombre}</td>
                <td className="border p-2">{act.marca}</td>
                <td className="border p-2">{act.modelo}</td>
                <td className="border p-2">{act.serial}</td>
                <td className="border p-2">{act.codigoInventario}</td>
                <td className="border p-2">{act.estado.replace('_', ' ')}</td>
                <td className="border p-2">{act.asignaciones?.[0]?.empleado?.nombre ?? act.asignaciones?.[0]?.area ?? 'No asignado'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(act)}
                    className="bg-yellow-500 text-white px-2 py-1 mr-1 rounded"
                  >
                    Editar
                  </button>
                  <Link href={`/activos/${act.id}`} className="bg-blue-500 text-white px-2 py-1 mr-1 rounded">
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(act.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}