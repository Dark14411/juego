@echo off
echo 🎮 Iniciando Retro Arcade Game...
echo.
echo 📁 Directorio: %cd%
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en PATH
    echo.
    echo 💡 Alternativas:
    echo    1. Instalar Python desde https://python.org
    echo    2. Abrir retro-arcade-game.html directamente en el navegador
    echo.
    pause
    exit /b 1
)

echo ✅ Python encontrado
echo.
echo 🚀 Iniciando servidor en http://localhost:8080
echo 🎯 Abre http://localhost:8080/retro-arcade-game.html para jugar
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python simple-server.py

pause