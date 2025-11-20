$indexPath = Join-Path $PSScriptRoot '..\index.html'
if (-not (Test-Path $indexPath)) {
    Write-Error "No se encontró index.html en la ruta esperada: $indexPath"
    exit 1
}

$content = Get-Content -Raw -LiteralPath $indexPath
$startMarker = '<!-- Sección Video Demo -->'
$endMarker = '<!-- Sección Blog/Comentarios -->'

$startIdx = $content.IndexOf($startMarker)
$endIdx = $content.IndexOf($endMarker)

if ($startIdx -lt 0 -or $endIdx -lt 0 -or $endIdx -le $startIdx) {
    Write-Error "No se encontraron los marcadores esperados en index.html."
    exit 1
}

$before = $content.Substring(0, $startIdx)
$after = $content.Substring($endIdx)

$newSection = @'
    <!-- Sección Video Demo -->
    <section id="video-demo" style="margin-top: 20px; text-align: center; background-color: var(--dark-bg); padding: 20px; border-radius: 10px; color: var(--text-dark);">
        <h2 style="font-size: 24px; color: var(--primary-color); margin-bottom: 10px;">Demo: Proyecto en Proceso</h2>
        <p style="font-size: 16px; color: var(--text-light); margin-bottom: 20px;">Muestra rápida del login / interfaz de escritorio (Java). Haz clic para ver más.</p>
        <div class="video-wrapper" style="display:flex;justify-content:center;">
            <video id="project-demo-video" autoplay muted loop playsinline style="width: 80%; max-width: 600px; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-lg); background: #000;">
                <source src="assets/proyectos/Proyecto_proceso.mp4" type="video/mp4">
                Tu navegador no soporta la reproducción de videos.
            </video>
        </div>
    </section>
'@

$newContent = $before + $newSection + $after

# Escribir el archivo (hacer backup primero)
$backupPath = "$indexPath.bak"
Try {
    Copy-Item -LiteralPath $indexPath -Destination $backupPath -Force
    Set-Content -LiteralPath $indexPath -Value $newContent -Encoding UTF8
    Write-Output "Se reaplicó la sección de video correctamente. Backup creado en: $backupPath"
} Catch {
    Write-Error "Error escribiendo index.html: $_"
    if (Test-Path $backupPath) { Remove-Item $backupPath -ErrorAction SilentlyContinue }
    exit 1
}
