'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then((data) => {
        setUser(data);
        setForm({ name: data.name, email: data.email });
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl mb-4">Profile</h1>
        {editing ? (
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full mb-2 p-2 border"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="block w-full mb-2 p-2 border"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 mr-2">Save</button>
            <button onClick={() => setEditing(false)} className="bg-gray-500 text-white px-4 py-2">Cancel</button>
          </form>
        ) : (
          <div>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 mr-2">Edit</button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}