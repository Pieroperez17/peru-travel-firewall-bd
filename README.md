# Firewall de base de datos con ProxySQL — Peru Travel

Proyecto del curso de Ciberseguridad (Universidad de Lima). Implementa un **firewall de base de datos** con ProxySQL delante de MariaDB, protegiendo una aplicación web vulnerable a propósito ("Peru Travel"). Un comando activa y desactiva el firewall en caliente para demostrar, antes y después, cómo detiene ataques a la capa de datos.

> ⚠️ **Entorno de laboratorio.** La aplicación es vulnerable a propósito y las credenciales son de prueba. No desplegar en internet.

## Arquitectura

```
Kali (atacante) ──► Peru Travel (app web) ──► ProxySQL (firewall de BD) ──► MariaDB
```

La base de datos no publica ningún puerto: solo se llega a ella a través de ProxySQL.

## Componentes

- **app/** — Peru Travel, agencia de turismo ficticia (Node.js + Express + EJS). Vulnerable a inyección SQL en el buscador, el detalle de tours y el login. Con `MODO_SEGURO=1` usa consultas parametrizadas.
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

## Casos de uso

1. Bloqueo de inyección SQL a nivel de base de datos
2. Lista blanca de consultas (modo aprendizaje y protección)
3. Bloqueo de sentencias peligrosas (DROP, TRUNCATE, GRANT) desde la cuenta de la aplicación
4. Control de acceso por usuario a tablas con datos personales
5. Auditoría de accesos a datos sensibles

## Herramientas

MariaDB 10.11 · ProxySQL 2.7.3 · Node.js 20 · Docker · Kali Linux (VirtualBox)
