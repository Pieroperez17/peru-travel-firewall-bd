# Firewall de base de datos con ProxySQL — Peru Travel

Proyecto del curso de Ciberseguridad (Universidad de Lima). Implementa un **firewall de base de datos** con ProxySQL delante de MariaDB, protegiendo una aplicación web vulnerable a propósito ("Peru Travel"). Un comando activa y desactiva el firewall en caliente para demostrar, antes y después, cómo detiene ataques a la capa de datos.

> ⚠️ **Entorno de laboratorio.** La aplicación es vulnerable a propósito y las credenciales son de prueba. No desplegar en internet.

## Arquitectura

```
Kali (atacante) ──► Peru Travel (app web) ──► ProxySQL (firewall de BD) ──► MariaDB
```

La base de datos no publica ningún puerto: solo se llega a ella a través de ProxySQL.

## Componentes

- **app/** — Peru Travel, agencia de turismo ficticia. Backend en Node.js + Express (`server.js`, API JSON) y frontend en React + Vite (`app/web/`). Vulnerable a inyección SQL en el buscador, el detalle de tours y el login. Con `MODO_SEGURO=1` usa consultas parametrizadas.
- **proxysql/proxysql.cnf** — configuración y reglas del firewall (inyección SQL, DDL/DCL, control por usuario, auditoría).
- **db/init.sql** — esquema y datos ficticios.
- **firewall.ps1** — comando `on` / `off` / `aprender` / `guardar` / `estado`.
- **sql/** — scripts que ejecuta cada acción del comando.

## Uso rápido

```powershell
docker compose up -d --build
```

- Aplicación: `http://localhost:8080`
- Activar firewall: `.\firewall.ps1 on`
- Desactivar: `.\firewall.ps1 off`

### Desarrollo del frontend (opcional)

Con la base de datos y ProxySQL levantados en Docker:

```powershell
cd app; npm install; npm run dev:api          # API en http://localhost:3000
cd app/web; npm install; npm run dev          # React en http://localhost:5173 (reenvía /api al backend)
```

En Docker no hace falta: la imagen compila el frontend y Express sirve la API y la página en el puerto 8080.

## Puntos vulnerables (API)

El navegador solo muestra la página; la inyección ocurre en el backend, que arma el SQL con la entrada recibida. Estos son los endpoints a atacar con Burp o sqlmap:

| Endpoint | Parámetro | Ejemplo |
|---|---|---|
| `GET /api/buscar` | `q` | `/api/buscar?q=' UNION SELECT id,usuario,password,rol,1,1 FROM usuarios-- -` |
| `GET /api/tour` | `id` | `/api/tour?id=1 OR 1=1` |
| `POST /api/login` | `usuario`, `password` (JSON o formulario) | `usuario=admin' -- ` |

Ejemplo con sqlmap desde Kali: `sqlmap -u "http://192.168.56.1:8080/api/buscar?q=cusco" --batch`

## Casos de uso

1. Bloqueo de inyección SQL a nivel de base de datos
2. Lista blanca de consultas (modo aprendizaje y protección)
3. Bloqueo de sentencias peligrosas (DROP, TRUNCATE, GRANT) desde la cuenta de la aplicación
4. Control de acceso por usuario a tablas con datos personales
5. Auditoría de accesos a datos sensibles

## Herramientas

MariaDB 10.11 · ProxySQL 2.7.3 · Node.js 22 · Express · React + Vite · Docker · Kali Linux (VirtualBox)
