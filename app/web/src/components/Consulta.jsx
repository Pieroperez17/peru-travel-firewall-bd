import { useApp } from '../App.jsx';

// Muestra el error de la base de datos (p. ej. el mensaje del firewall cuando bloquea)
// y la consulta SQL que el backend envio a ProxySQL.
export default function Consulta({ sql, error }) {
  const { mostrarSql } = useApp();
  return (
    <>
      {error && (
        <div className="caja-error">
          <strong>Error de base de datos</strong>
          <code>{error}</code>
        </div>
      )}
      {mostrarSql && sql && (
        <details className="caja-sql" open>
          <summary>Consulta enviada a la base de datos</summary>
          <pre>{sql}</pre>
        </details>
      )}
    </>
  );
}
