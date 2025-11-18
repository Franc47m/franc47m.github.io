# Convertir MKV a MP4 usando FFmpeg
# Requiere FFmpeg instalado y accesible en PATH
# Uso: Abre PowerShell en la carpeta del proyecto y ejecuta: .\scripts\convert_to_mp4.ps1

$input = "acces/ProyectoEnproceso.mkv"
$output = "acces/ProyectoEnproceso.mp4"

if (!(Test-Path $input)) {
    Write-Host "ERROR: No se encontró el archivo de entrada: $input" -ForegroundColor Red
    exit 1
}

Write-Host "Convirtiendo $input -> $output ..." -ForegroundColor Cyan

# Comando recomendado: H.264 para video y AAC para audio (alta compatibilidad)
ffmpeg -i "$input" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "$output"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Conversión completada. Archivo generado: $output" -ForegroundColor Green
} else {
    Write-Host "La conversión falló. Revisa la salida de FFmpeg para más detalles." -ForegroundColor Red
}
