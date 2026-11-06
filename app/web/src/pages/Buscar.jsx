import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../api.js';
import Consulta from '../components/Consulta.jsx';
import Tarjetas from '../components/Tarjetas.jsx';
import useTitulo from '../components/useTitulo.js';

// Caso 1: inyeccion SQL en el buscador. El texto viaja sin filtrar a GET /api/buscar?q=
export default function Buscar() {
  useTitulo('Buscar');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [texto, setTexto] = useState(q);
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    setTexto(q);
    api.buscar(q).then(setDatos);
  }, [q]);

  const buscar = (e) => {
    e.preventDefault();
    setParams({ q: texto });
  };

  return (
    <>
      <h1>Buscar tours</h1>
      <form className="buscador" onSubmit={buscar}>
        <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Tour o destino" />
        <button type="submit">Buscar</button>
      </form>
      {datos && (
        <>
          <Consulta sql={datos.sql} error={datos.error} />
          {!datos.error && (
            <>
              <p className="resumen">{datos.tours.length} resultado(s){q ? ` para "${q}"` : ''}</p>
              <Tarjetas tours={datos.tours} />
            </>
          )}
        </>
      )}
    </>
  );
}
