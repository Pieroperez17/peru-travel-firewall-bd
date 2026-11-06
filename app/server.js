/*
 * Peru Travel - aplicacion web VULNERABLE A PROPOSITO.
 * Uso exclusivo en el laboratorio local del curso de Ciberseguridad.
 * No desplegar en internet.
 *
 * Backend: API JSON en Express. El frontend es React (Vite) y vive en ./web.
 * La app se conecta a ProxySQL (firewall de base de datos), nunca directo a MariaDB.
 *
 * MODO_SEGURO=0 -> consultas armadas concatenando la entrada del usuario (vulnerables)
 * MODO_SEGURO=1 -> consultas parametrizadas (la correccion recomendada)
 * MOSTRAR_SQL=1 -> devuelve la consulta enviada para mostrarla en pantalla (con fines didacticos)
 */
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const MODO_SEGURO = process.env.MODO_SEGURO === '1';
const MOSTRAR_SQL = process.env.MOSTRAR_SQL !== '0';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'proxysql',
  port: Number(process.env.DB_PORT || 6033),
  user: process.env.DB_USER || 'perutravel_app',
  password: process.env.DB_PASSWORD || 'PeruApp2026',
  database: process.env.DB_NAME || 'perutravel',
  charset: 'utf8mb4',
  connectionLimit: 10,
  multipleStatements: false,
}).promise();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // tambien acepta formularios (util para sqlmap/Burp)
app.use(session({
  secret: process.env.SESSION_SECRET || 'laboratorio-peru-travel',
  resave: false,
  saveUninitialized: false,
}));

// Ejecuta una consulta y devuelve { filas, sql, error } sin romper la respuesta.
// El mensaje de error se devuelve tal cual: asi se ve en pantalla cuando el firewall bloquea.
async function consultar(sql, params = []) {
  const textoSql = params.length ? mysql.format(sql, params) : sql;
  try {
    const [filas] = await pool.query(sql, params);
    return { filas, sql: MOSTRAR_SQL ? textoSql : null, error: null };
  } catch (e) {
    return { filas: [], sql: MOSTRAR_SQL ? textoSql : null, error: e.message };
  }
}

const api = express.Router();

// ---------- Estado de la app (modo y sesion) ----------
api.get('/estado', (req, res) => {
  res.json({ modoSeguro: MODO_SEGURO, mostrarSql: MOSTRAR_SQL, usuario: req.session.usuario || null });
});

// ---------- Inicio: catalogo de tours ----------
api.get('/tours', async (req, res) => {
  const r = await consultar('SELECT id, nombre, destino, region, dias, precio FROM tours ORDER BY id');
  res.json({ tours: r.filas, error: r.error });
});

// ---------- Buscador (caso 1: inyeccion SQL) ----------
api.get('/buscar', async (req, res) => {
  const q = req.query.q || '';
  let r;
  if (MODO_SEGURO) {
    r = await consultar(
      'SELECT id, nombre, destino, region, dias, precio FROM tours WHERE nombre LIKE ? OR destino LIKE ?',
      [`%${q}%`, `%${q}%`]);
  } else {
    // VULNERABLE: la entrada del usuario se concatena dentro del SQL
    r = await consultar(
      `SELECT id, nombre, destino, region, dias, precio FROM tours WHERE nombre LIKE '%${q}%' OR destino LIKE '%${q}%'`);
  }
  res.json({ q, tours: r.filas, sql: r.sql, error: r.error });
});

// ---------- Detalle de un tour (caso 1: inyeccion SQL numerica) ----------
api.get('/tour', async (req, res) => {
  const id = req.query.id || '1';
  let r;
  if (MODO_SEGURO) {
    r = await consultar('SELECT id, nombre, destino, region, dias, precio, descripcion FROM tours WHERE id = ?', [id]);
  } else {
    // VULNERABLE: el id se concatena sin comillas ni validacion
    r = await consultar(`SELECT id, nombre, destino, region, dias, precio, descripcion FROM tours WHERE id = ${id}`);
  }
  const resenas = await consultar(
    'SELECT autor, comentario, puntaje, DATE_FORMAT(fecha, \'%d/%m/%Y\') AS fecha FROM resenas WHERE tour_id = ? ORDER BY fecha DESC',
    [Number(id) || 0]);
  res.json({ id, tours: r.filas, resenas: resenas.filas, sql: r.sql, error: r.error });
});

// ---------- Publicar resena (trafico normal para la lista blanca) ----------
api.post('/tour/resena', async (req, res) => {
  const { tour_id, autor, comentario, puntaje } = req.body;
  const r = await consultar(
    'INSERT INTO resenas (tour_id, autor, comentario, puntaje, fecha) VALUES (?, ?, ?, ?, NOW())',
    [Number(tour_id) || 0, String(autor || 'Anonimo').slice(0, 60), String(comentario || '').slice(0, 500), Number(puntaje) || 5]);
  res.status(r.error ? 500 : 201).json({ ok: !r.error, error: r.error });
});

// ---------- Login del personal (caso 1: inyeccion SQL en autenticacion) ----------
api.post('/login', async (req, res) => {
  const u = req.body.usuario || '';
  const p = req.body.password || '';
  let r;
  if (MODO_SEGURO) {
    r = await consultar(
      'SELECT id, usuario, nombre, rol FROM usuarios WHERE usuario = ? AND password = SHA2(?, 256)', [u, p]);
  } else {
    // VULNERABLE: usuario y contrasena se concatenan dentro del SQL
    r = await consultar(
      `SELECT id, usuario, nombre, rol FROM usuarios WHERE usuario = '${u}' AND password = SHA2('${p}', 256)`);
  }
  if (!r.error && r.filas.length > 0) {
    req.session.usuario = r.filas[0];
    return res.json({ usuario: r.filas[0], sql: r.sql });
  }
  res.status(401).json({
    mensaje: r.error ? null : 'Usuario o contrasena incorrectos',
    sql: r.sql, error: r.error,
  });
});

api.post('/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

// ---------- Panel interno: reservas con datos de clientes (acceso legitimo a datos sensibles) ----------
api.get('/admin', async (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Sesion requerida' });
  const r = await consultar(
    `SELECT r.id, c.nombres, c.dni, c.correo, t.nombre AS tour, DATE_FORMAT(r.fecha_viaje, '%d/%m/%Y') AS fecha, r.personas, r.total
       FROM reservas r
       JOIN clientes c ON c.id = r.cliente_id
       JOIN tours t ON t.id = r.tour_id
      ORDER BY r.fecha_viaje`);
  res.json({ usuario: req.session.usuario, reservas: r.filas, error: r.error });
});

app.use('/api', api);

// ---------- Frontend React compilado (web/dist) ----------
const DIST = path.join(__dirname, 'web', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // Rutas del frontend (/, /buscar, /tour, /login, /admin) -> index.html; React Router decide que mostrar
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Peru Travel escuchando en el puerto ${PORT} | modo ${MODO_SEGURO ? 'SEGURO' : 'VULNERABLE'}`);
});
