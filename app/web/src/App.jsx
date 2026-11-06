import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router';
import { api } from './api.js';
import Cabecera from './components/Cabecera.jsx';
import Pie from './components/Pie.jsx';
import Inicio from './pages/Inicio.jsx';
import Buscar from './pages/Buscar.jsx';
import Tour from './pages/Tour.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';

// Estado global: modo de la app (seguro/vulnerable), si se muestra el SQL y el usuario en sesion
const AppContexto = createContext(null);
export const useApp = () => useContext(AppContexto);

export default function App() {
  const [estado, setEstado] = useState({ modoSeguro: false, mostrarSql: true, usuario: null, cargado: false });

  useEffect(() => {
    api.estado().then((e) => setEstado({ ...e, cargado: true }));
  }, []);

  const setUsuario = (usuario) => setEstado((e) => ({ ...e, usuario }));

  return (
    <AppContexto.Provider value={{ ...estado, setUsuario }}>
      <Cabecera />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/tour" element={<Tour />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<p className="resumen">Página no encontrada.</p>} />
        </Routes>
      </main>
      <Pie />
    </AppContexto.Provider>
  );
}
