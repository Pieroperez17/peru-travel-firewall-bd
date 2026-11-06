-- FIREWALL DESACTIVADO: reglas de bloqueo y lista blanca apagadas.
-- La regla 5 (auditoria) sigue activa para dejar evidencia de lo que pasa sin proteccion.
UPDATE mysql_query_rules SET active=0 WHERE rule_id BETWEEN 10 AND 39;
LOAD MYSQL QUERY RULES TO RUNTIME;
SET mysql-firewall_whitelist_enabled=0;
LOAD MYSQL VARIABLES TO RUNTIME;
SELECT 'FIREWALL DESACTIVADO' AS estado;
