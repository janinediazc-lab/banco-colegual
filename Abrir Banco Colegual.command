#!/bin/bash
# ----------------------------------------------------
# Banco Escolar Colegual - Lanzador Automático Web
# Escuela Rural Colegual - Llanquihue
# ----------------------------------------------------

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================="
echo "   🏛️ INICIANDO BANCO ESCOLAR COLEGUAL"
echo "   🪙 Sistema de ColegualCoins y Recompensas"
echo "================================================="
echo ""

# Verificar si el servidor ya está activo en el puerto 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ El servidor ya se encuentra en ejecución."
else
    echo "🚀 Iniciando servidor web local..."
    npx vite --host --port 5173 > /dev/null 2>&1 &
    sleep 1.5
fi

# Detectar IP en la red Wi-Fi
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo "🌐 Plataforma lista:"
echo "   • En este computador:   http://localhost:5173"
echo "   • En celulares/tablets: http://${LOCAL_IP}:5173"
echo ""
echo "Abriendo navegador web..."

open "http://localhost:5173"

echo "Listo. Puedes cerrar esta ventana si lo deseas."
