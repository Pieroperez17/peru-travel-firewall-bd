import { Link } from 'react-router';

export const claseRegion = (region) => `tarjeta-banda region-${String(region || '').toLowerCase().replace(/[^a-z]/g, '')}`;
export const soles = (monto) => `S/ ${Number(monto).toFixed(2)}`;

export default function Tarjetas({ tours }) {
  return (
    <div className="grilla">
      {tours.map((t, i) => (
        <Link key={`${t.id}-${i}`} className="tarjeta" to={`/tour?id=${t.id}`}>
          <div className={claseRegion(t.region)}>
            <span>{t.region}</span>
          </div>
          <div className="tarjeta-cuerpo">
            <h3>{t.nombre}</h3>
            <p className="destino">{t.destino}</p>
            <p className="detalle">{t.dias} día(s) · desde <strong>{soles(t.precio)}</strong></p>
          </div>
        </Link>
      ))}
    </div>
  );
}
