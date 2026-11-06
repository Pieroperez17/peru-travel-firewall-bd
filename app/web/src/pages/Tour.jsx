import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../api.js';
import Consulta from '../components/Consulta.jsx';
import { claseRegion, soles } from '../components/Tarjetas.jsx';
import useTitulo from '../components/useTitulo.js';

const RESENA_VACIA = { autor: '', puntaje: '5', comentario: '' };

// Caso 1: inyeccion SQL numerica. El id viaja sin validar a GET /api/tour?id=
export default function Tour() {
  useTitulo('Tour');
  const [params] = useSearchParams();
  const id = params.get('id') || '1';
  const [datos, setDatos] = useState(null);
  const [resena, setResena] = useState(RESENA_VACIA);
  const [errorResena, setErrorResena] = useState(null);

  const cargar = useCallback(() => api.tour(id).then(setDatos), [id]);
  useEffect(() => { cargar(); }, [cargar]);

  if (!datos) return null;
  const { tours, resenas, sql, error } = datos;

  const cambiar = (campo) => (e) => setResena({ ...resena, [campo]: e.target.value });

  const publicar = async (e) => {
    e.preventDefault();
    const r = await api.publicarResena({ tour_id: tours[0].id, ...resena });
    setErrorResena(r.error || null);
    if (r.ok) {
      setResena(RESENA_VACIA);
      cargar();
    }
  };

  return (
    <>
      <Consulta sql={sql} error={error} />
      {!error && tours.length === 0 && <p className="resumen">No se encontró el tour solicitado.</p>}

      {tours.map((t, i) => (
        <article key={`${t.id}-${i}`} className="ficha">
          <div className={claseRegion(t.region)}>
            <span>{t.region}</span>
          </div>
          <div className="ficha-cuerpo">
            <h1>{t.nombre}</h1>
            <p className="destino">{t.destino} · {t.dias} día(s)</p>
            <p>{t.descripcion}</p>
            <p className="precio">{soles(t.precio)} <small>por persona</small></p>
          </div>
        </article>
      ))}

      {!error && tours.length > 0 && (
        <section className="resenas">
          <h2>Reseñas de viajeros</h2>
          {resenas.length === 0 && <p className="resumen">Aún no hay reseñas.</p>}
          {resenas.map((r, i) => (
            <div key={i} className="resena">
              <strong>{r.autor}</strong> <span className="estrellas">{'★'.repeat(r.puntaje)}</span>
              <small>{r.fecha}</small>
              <p>{r.comentario}</p>
            </div>
          ))}
          <form className="form-resena" onSubmit={publicar}>
            <h3>Deja tu reseña</h3>
            <input type="text" value={resena.autor} onChange={cambiar('autor')} placeholder="Tu nombre" required />
            <select value={resena.puntaje} onChange={cambiar('puntaje')}>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
            <textarea value={resena.comentario} onChange={cambiar('comentario')} placeholder="Cuéntanos tu experiencia" required />
            <button type="submit">Publicar</button>
            {errorResena && <p className="mensaje">{errorResena}</p>}
          </form>
        </section>
      )}
    </>
  );
}
