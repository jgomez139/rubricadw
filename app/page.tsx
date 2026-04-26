import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <main className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-semibold">Sistema de Gestión de Activos Tecnológicos</h1>
        <div className="flex gap-4">
          <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">Register</Link>
          <Link href="/login" className="bg-green-500 text-white px-4 py-2 rounded">Login</Link>
          <Link href="/categorias" className="bg-purple-500 text-white px-4 py-2 rounded">Categorías</Link>
          <Link href="/activos" className="bg-orange-500 text-white px-4 py-2 rounded">Activos</Link>
          <Link href="/empleados" className="bg-teal-500 text-white px-4 py-2 rounded">Empleados</Link>
        </div>
      </main>
    </div>
  );
}
