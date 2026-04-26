'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [newNombre, setNewNombre] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const res = await fetch('/api/categorias');
    if (res.ok) {
      const data = await res.json();
      setCategorias(data);
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newNombre }),
    });
    if (res.ok) {
      setNewNombre('');
      fetchCategorias();
    }
  };

  const handleUpdate = async (id: number, nombre: string, activo: boolean) => {
    const res = await fetch(`/api/categorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, activo }),
    });
    if (res.ok) {
      setEditing(null);
      fetchCategorias();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategorias();
      }
    }
  };

  const toggleActivo = async (id: number, activo: boolean) => {
    await handleUpdate(id, categorias.find(c => c.id === id)?.nombre || '', !activo);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías</h1>

      <form onSubmit={handleCreate} className="mb-4">
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newNombre}
          onChange={(e) => setNewNombre(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Crear</button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border">
              <td className="border p-2">
                {editing === cat.id ? (
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="border p-1"
                  />
                ) : (
                  cat.nombre
                )}
              </td>
              <td className="border p-2">
                <span className={cat.activo ? 'text-green-600' : 'text-red-600'}>
                  {cat.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="border p-2">
                {editing === cat.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(cat.id, editNombre, cat.activo)}
                      className="bg-green-500 text-white px-2 py-1 mr-1"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="bg-gray-500 text-white px-2 py-1"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(cat.id);
                        setEditNombre(cat.nombre);
                      }}
                      className="bg-yellow-500 text-white px-2 py-1 mr-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(cat.id, cat.activo)}
                      className={`px-2 py-1 mr-1 ${cat.activo ? 'bg-red-500' : 'bg-green-500'} text-white`}
                    >
                      {cat.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-500 text-white px-2 py-1"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}