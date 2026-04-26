'use client';

import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'QUERY_USER' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl mb-4">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="block w-full mb-2 p-2 border"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="block w-full mb-2 p-2 border"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="block w-full mb-2 p-2 border"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="block w-full mb-2 p-2 border"
        >
          <option value="QUERY_USER">Usuario Consulta</option>
          <option value="TECHNICIAN">Técnico</option>
          <option value="ADMINISTRATOR">Administrador</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Register</button>
        <p className="mt-2">{message}</p>
      </form>
    </div>
  );
}