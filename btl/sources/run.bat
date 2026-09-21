@echo off
title AI Maze Pathfinding Simulator - BFS vs DFS vs A*
cd /d "%~dp0"
echo ======================================================================
echo    MO PHONG TIM DUONG ME CUNG BANG BFS, DFS VA A* (SONG SONG)
echo    BTL Mon Tri Tue Nhan Tao - Nhom 10 - EAUT
echo ======================================================================
echo.
echo Dang khoi dong may chu web cuc bo...
start "" "http://localhost:8000"
python -m http.server 8000
if %ERRORLEVEL% NEQ 0 (
    echo Khong tim thay Python, dang mo truc tiep bang trinh duyet...
    start "" "index.html"
)
pause
