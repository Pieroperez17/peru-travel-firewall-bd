import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { api } from '../api.js';
import { useApp } from '../App.jsx';
import Consulta from '../components/Consulta.jsx';
import { soles } from '../components/Tarjetas.jsx';
import useTitulo from '../components/useTitulo.js';

// Panel interno: reservas con datos personales de clientes (acceso legitimo a datos sensibles)
export default function Admin() {
  useTitulo('Reservas');
  const { usuario, cargado } = useApp();
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    if (usuario) api.admin().then(setDatos);
  }, [usuario]);

  if (!cargado) return null;
  if (!usuario || datos?.status === 401) return <Navigate to="/login" replace />;
  if (!datos) return null;

  return (
    <>
      <h1>Reservas confirmadas</h1>
      <p className="resumen">
        Sesión: <strong>{usuario.nombre}</strong> (rol {usuario.rol}). Esta vista contiene datos personales de clientes.
      </p>
      <Consulta error={datos.error} />
      <table className="tabla">
        <thead>
          <tr><th>#</th><th>Cliente</th><th>DNI</th><th>Correo</th><th>Tour</th><th>Fecha</th><th>Personas</th><th>Total</th></tr>
        </thead>
        <tbody>
          {datos.reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.nombres}</td><td>{r.dni}</td><td>{r.correo}</td>
              <td>{r.tour}</td><td>{r.fecha}</td><td>{r.personas}</td>
              <td>{soles(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
