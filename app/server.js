/*
 * Peru Travel - aplicacion web VULNERABLE A PROPOSITO.
 * Uso exclusivo en el laboratorio local del curso de Ciberseguridad.
 * No desplegar en internet.
 *
 * La app se conecta a ProxySQL (firewall de base de datos), nunca directo a MariaDB.
 *
 * MODO_SEGURO=0 -> consultas armadas concatenando la entrada del usuario (vulnerables)
 * MODO_SEGURO=1 -> consultas parametrizadas (la correccion recomendada)
 * MOSTRAR_SQL=1 -> muestra en pantalla la consulta enviada (con fines didacticos)
 */
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'laboratorio-peru-travel',
  resave: false,
  saveUninitialized: false,
}));

// Variables disponibles en todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.modoSeguro = MODO_SEGURO;
  res.locals.mostrarSql = MOSTRAR_SQL;
  res.locals.sql = null;
  res.locals.error = null;
  next();
});

// Ejecuta una consulta y devuelve { filas, sql, error } sin romper la pagina.
// El mensaje de error se muestra tal cual: asi se ve en pantalla cuando el firewall bloquea.
async function consultar(sql, params = []) {
  const textoSql = params.length ? mysql.format(sql, params) : sql;
  try {
    const [filas] = await pool.query(sql, params);
    return { filas, sql: textoSql, error: null };
  } catch (e) {
    return { filas: [], sql: textoSql, error: e.message };
  }
}

// ---------- Inicio: catalogo de tours ----------
app.get('/', async (req, res) => {
  const r = await consultar('SELECT id, nombre, destino, region, dias, precio FROM tours ORDER BY id');
  res.render('inicio', { tours: r.filas, error: r.error });
});

// ---------- Buscador (caso 1: inyeccion SQL) ----------
app.get('/buscar', async (req, res) => {
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
  res.render('buscar', { q, tours: r.filas, sql: r.sql, error: r.error });
});

// ---------- Detalle de un tour (caso 1: inyeccion SQL numerica) ----------
app.get('/tour', async (req, res) => {
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
  res.render('tour', { id, tours: r.filas, resenas: resenas.filas, sql: r.sql, error: r.error });
});

// ---------- Publicar resena (trafico normal para la lista blanca) ----------
app.post('/tour/resena', async (req, res) => {
  const { tour_id, autor, comentario, puntaje } = req.body;
  await consultar(
    'INSERT INTO resenas (tour_id, autor, comentario, puntaje, fecha) VALUES (?, ?, ?, ?, NOW())',
    [Number(tour_id) || 0, (autor || 'Anonimo').slice(0, 60), (comentario || '').slice(0, 500), Number(puntaje) || 5]);
  res.redirect(`/tour?id=${Number(tour_id) || 1}`);
});

// ---------- Login del personal (caso 1: inyeccion SQL en autenticacion) ----------
app.get('/login', (req, res) => res.render('login', { mensaje: null }));

app.post('/login', async (req, res) => {
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
    return res.redirect('/admin');
  }
  res.render('login', {
    mensaje: r.error ? null : 'Usuario o contrasena incorrectos',
    sql: r.sql, error: r.error,
  });
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

// ---------- Panel interno: reservas con datos de clientes (acceso legitimo a datos sensibles) ----------
app.get('/admin', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');
  const r = await consultar(
    `SELECT r.id, c.nombres, c.dni, c.correo, t.nombre AS tour, DATE_FORMAT(r.fecha_viaje, '%d/%m/%Y') AS fecha, r.personas, r.total
       FROM reservas r
       JOIN clientes c ON c.id = r.cliente_id
       JOIN tours t ON t.id = r.tour_id
      ORDER BY r.fecha_viaje`);
  res.render('admin', { reservas: r.filas, error: r.error });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Peru Travel escuchando en el puerto ${PORT} | modo ${MODO_SEGURO ? 'SEGURO' : 'VULNERABLE'}`);
});
