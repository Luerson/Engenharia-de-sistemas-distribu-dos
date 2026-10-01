import React, { useState, useEffect } from 'react';

const API_BASE = 'https://api.gofood.example';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function handleLogin(email, password) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error('Credenciais inválidas');
    }

    const data = await res.json();
    setUser(data);
    await checkAdminAccess();
  }

  async function checkAdminAccess() {
    const res = await fetch(`${API_BASE}/api/me`, {
      credentials: 'include'
    });

    if (!res.ok) {
      setIsAdmin(false);
      return;
    }

    const data = await res.json();
    setIsAdmin(data.role === 'admin');
  }

  useEffect(() => {
    checkAdminAccess().catch(() => setIsAdmin(false));
  }, []);

  function ProductComments({ comments }) {
    return (
      <div>
        {comments.map(c => (
          <div key={c.id}>
            {c.text}
          </div>
        ))}
      </div>
    );
  }

  return (
    <main>
      {/* A autorização real ocorre no servidor. */}
      {isAdmin && <div>Painel Admin disponível</div>}
    </main>
  );
}

export default App;
