<#
  Activa, desactiva o consulta el firewall de base de datos (ProxySQL).

  Uso (desde la carpeta del proyecto):
    powershell -ExecutionPolicy Bypass -File .\firewall.ps1 on
    powershell -ExecutionPolicy Bypass -File .\firewall.ps1 off
    powershell -ExecutionPolicy Bypass -File .\firewall.ps1 aprender
    powershell -ExecutionPolicy Bypass -File .\firewall.ps1 guardar
    powershell -ExecutionPolicy Bypass -File .\firewall.ps1 estado
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet('on', 'off', 'aprender', 'guardar', 'estado')]
    [string]$accion = 'estado'
)

$archivo = Join-Path $PSScriptRoot "sql\$accion.sql"
if (-not (Test-Path $archivo)) {
    Write-Error "No existe $archivo"
    exit 1
}

# Los comandos se envian a la consola de administracion de ProxySQL (puerto 6032),
# que solo es accesible dentro de la red de Docker. Se usa el cliente del contenedor "db".
Get-Content -Raw $archivo |
    docker exec -i db mariadb -h proxysql -P 6032 -u radmin -pradmin --table

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo el comando. Revisa que los contenedores esten activos: docker compose ps"
    exit $LASTEXITCODE
}

if ($accion -ne 'estado') {
    Get-Content -Raw (Join-Path $PSScriptRoot 'sql\estado.sql') |
        docker exec -i db mariadb -h proxysql -P 6032 -u radmin -pradmin --table
}
