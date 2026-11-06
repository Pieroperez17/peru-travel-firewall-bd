-- Copia a la lista blanca las consultas que la app hizo durante el aprendizaje.
DELETE FROM mysql_firewall_whitelist_rules WHERE username='perutravel_app';
INSERT INTO mysql_firewall_whitelist_rules (active, username, client_address, schemaname, flagIN, digest, comment)
  SELECT DISTINCT 1, username, '', schemaname, 0, digest, substr(digest_text, 1, 200)
  FROM stats.stats_mysql_query_digest
  WHERE username='perutravel_app';
LOAD MYSQL FIREWALL TO RUNTIME;
SELECT COUNT(*) AS consultas_en_lista_blanca FROM mysql_firewall_whitelist_rules WHERE username='perutravel_app';
SELECT schemaname, comment AS consulta_permitida FROM mysql_firewall_whitelist_rules WHERE username='perutravel_app';
