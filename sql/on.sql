-- FIREWALL ACTIVADO: reglas de bloqueo (casos 1, 3 y 4) + lista blanca (caso 2).
UPDATE mysql_query_rules SET active=1 WHERE rule_id BETWEEN 10 AND 39;
LOAD MYSQL QUERY RULES TO RUNTIME;
-- La lista blanca solo protege si ya se aprendio algo; si esta vacia, queda en OFF
-- para no bloquear toda la aplicacion.
REPLACE INTO mysql_firewall_whitelist_users (active, username, client_address, mode, comment)
  SELECT 1, 'perutravel_app', '', CASE WHEN COUNT(*) > 0 THEN 'PROTECTING' ELSE 'OFF' END, 'Aplicacion Peru Travel'
  FROM mysql_firewall_whitelist_rules WHERE username='perutravel_app';
REPLACE INTO mysql_firewall_whitelist_users (active, username, client_address, mode, comment) VALUES (1, 'analista', '', 'OFF', 'Analista: controlado por reglas');
LOAD MYSQL FIREWALL TO RUNTIME;
SET mysql-firewall_whitelist_enabled=1;
LOAD MYSQL VARIABLES TO RUNTIME;
SELECT 'FIREWALL ACTIVADO' AS estado;
SELECT username, mode AS lista_blanca FROM mysql_firewall_whitelist_users;
