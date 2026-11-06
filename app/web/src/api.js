// Cliente de la API del backend. Todas las rutas viven bajo /api.
// La entrada del usuario se envia TAL CUAL: la vulnerabilidad esta en el backend (server.js).

async function pedir(url, opciones = {}) {
  const res = await fetch(url, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
  });
  const datos = await res.json().catch(() => ({ error: `Respuesta invalida del servidor (${res.status})` }));
  return { status: res.status, ...datos };
}

export const api = {
  estado: () => pedir('/api/estado'),
  tours: () => pedir('/api/tours'),
  buscar: (q) => pedir(`/api/buscar?q=${encodeURIComponent(q)}`),
  tour: (id) => pedir(`/api/tour?id=${encodeURIComponent(id)}`),
  publicarResena: (resena) => pedir('/api/tour/resena', { method: 'POST', body: JSON.stringify(resena) }),
  login: (usuario, password) => pedir('/api/login', { method: 'POST', body: JSON.stringify({ usuario, password }) }),
  logout: () => pedir('/api/logout', { method: 'POST' }),
  admin: () => pedir('/api/admin'),
};
