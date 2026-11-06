import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api.js';
import Consulta from '../components/Consulta.jsx';
import Tarjetas from '../components/Tarjetas.jsx';
import useTitulo from '../components/useTitulo.js';

export default function Inicio() {
  useTitulo('Tours');
  const [datos, setDatos] = useState({ tours: [], error: null });
  const [q, setQ] = useState('');
  const navegar = useNavigate();

  useEffect(() => {
    api.tours().then(setDatos);
  }, []);

  const buscar = (e) => {
    e.preventDefault();
    navegar(`/buscar?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <section className="portada">
        <h1>Descubre el Perú con nosotros</h1>
        <p>Tours por Cusco, Puno, Arequipa, Ica, Amazonas y Madre de Dios.</p>
        <form className="buscador" onSubmit={buscar}>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por tour o destino, p. ej. Cusco" />
          <button type="submit">Buscar</button>
        </form>
      </section>
      <Consulta error={datos.error} />
      <h2>Nuestros tours</h2>
      <Tarjetas tours={datos.tours} />
    </>
  );
}
