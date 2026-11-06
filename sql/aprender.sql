-- MODO APRENDIZAJE (caso 2): todo se permite, pero ProxySQL registra
-- en su log cada consulta que no esta en la lista blanca.
-- Se reinician las estadisticas para aprender solo trafico legitimo desde ahora.
UPDATE mysql_query_rules SET active=0 WHERE rule_id BETWEEN 10 AND 39;
LOAD MYSQL QUERY RULES TO RUNTIME;
DELETE FROM mysql_firewall_whitelist_rules;
REPLACE INTO mysql_firewall_whitelist_users (active, username, client_address, mode, comment) VALUES (1, 'perutravel_app', '', 'DETECTING', 'Aplicacion Peru Travel');
REPLACE INTO mysql_firewall_whitelist_users (active, username, client_address, mode, comment) VALUES (1, 'analista', '', 'OFF', 'Analista: controlado por reglas');
LOAD MYSQL FIREWALL TO RUNTIME;
SET mysql-firewall_whitelist_enabled=1;
LOAD MYSQL VARIABLES TO RUNTIME;
SELECT COUNT(*) AS digests_reiniciados FROM stats_mysql_query_digest_reset;
SELECT 'MODO APRENDIZAJE: usa Peru Travel de forma normal y luego ejecuta: guardar' AS estado;
