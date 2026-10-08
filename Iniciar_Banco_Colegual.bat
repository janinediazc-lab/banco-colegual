@echo off
title Banco Escolar Colegual
echo =================================================
echo    BANCO ESCOLAR COLEGUAL - Llanquihue
echo    Sistema de ColegualCoins y Recompensas
echo =================================================
echo.
echo Iniciando servidor web...
start /b npx vite --host --port 5173
timeout /t 2 /nobreak >nul
echo Abriendo navegador web...
start http://localhost:5173
echo.
echo Plataforma web abierta exitosamente.
pause
