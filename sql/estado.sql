-- Estado actual del firewall y contador de coincidencias por regla (evidencia).
SELECT variable_value AS lista_blanca_habilitada FROM runtime_global_variables WHERE variable_name='mysql-firewall_whitelist_enabled';
SELECT username, mode AS lista_blanca FROM mysql_firewall_whitelist_users;
SELECT COUNT(*) AS consultas_en_lista_blanca FROM mysql_firewall_whitelist_rules;
SELECT rule_id, active, comment FROM mysql_query_rules ORDER BY rule_id;
SELECT rule_id, hits AS coincidencias FROM stats_mysql_query_rules ORDER BY rule_id;
