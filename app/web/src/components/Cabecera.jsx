import { Link, useNavigate } from 'react-router';
import { useApp } from '../App.jsx';
import { api } from '../api.js';

export default function Cabecera() {
  const { modoSeguro, usuario, setUsuario } = useApp();
  const navegar = useNavigate();

  const salir = async () => {
    await api.logout();
    setUsuario(null);
    navegar('/');
  };

  return (
    <>
      <div className="aviso-lab">
        Laboratorio de Ciberseguridad · aplicación vulnerable a propósito · modo{' '}
        <strong>{modoSeguro ? 'SEGURO (consultas parametrizadas)' : 'VULNERABLE'}</strong>
      </div>
      <header className="cabecera">
        <Link className="marca" to="/">
          <span className="marca-sol"></span>
          <span>Peru <em>Travel</em></span>
        </Link>
        <nav>
          <Link to="/">Tours</Link>
          <Link to="/buscar">Buscar</Link>
          {usuario ? (
            <>
              <Link to="/admin">Reservas</Link>
              <button type="button" className="enlace" onClick={salir}>Salir ({usuario.usuario})</button>
            </>
          ) : (
            <Link to="/login">Acceso personal</Link>
          )}
        </nav>
      </header>
    </>
  );
}
