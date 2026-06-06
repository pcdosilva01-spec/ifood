@echo off
echo Iniciando servidor local na porta 8000...
echo.
echo Abra no navegador: http://localhost:8000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
python -m http.server 8000
