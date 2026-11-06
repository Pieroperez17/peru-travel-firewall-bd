import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api.js';
import { useApp } from '../App.jsx';
import Consulta from '../components/Consulta.jsx';
import useTitulo from '../components/useTitulo.js';

// Caso 1: inyeccion SQL en autenticacion. Usuario y contrasena viajan sin filtrar a POST /api/login
export default function Login() {
  useTitulo('Acceso personal');
  const { setUsuario } = useApp();
  const navegar = useNavigate();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [resultado, setResultado] = useState(null);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const ingresar = async (e) => {
    e.preventDefault();
    const r = await api.login(form.usuario, form.password);
    if (r.usuario) {
      setUsuario(r.usuario);
      navegar('/admin');
    } else {
      setResultado(r);
    }
  };

  return (
    <>
      <div className="login">
        <h1>Acceso del personal</h1>
        <p className="resumen">Solo para vendedores y administradores de Peru Travel.</p>
        <form onSubmit={ingresar}>
          <label>Usuario <input type="text" value={form.usuario} onChange={cambiar('usuario')} autoComplete="off" required /></label>
          <label>Contraseña <input type="password" value={form.password} onChange={cambiar('password')} /></label>
          <button type="submit">Ingresar</button>
        </form>
        {resultado?.mensaje && <p className="mensaje">{resultado.mensaje}</p>}
      </div>
      {resultado && <Consulta sql={resultado.sql} error={resultado.error} />}
    </>
  );
}
