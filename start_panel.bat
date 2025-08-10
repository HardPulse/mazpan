@echo off
echo Starting Gyat Panel...

:: Запуск backend
echo Starting backend on port 8002...
cd /d D:\Avtoreger\data\zenka\KZ2\aaa\app\backend
start "Backend" cmd /k uvicorn server:app --host 0.0.0.0 --port 8007 --reload

:: Задержка 10 секунд
echo Waiting 10 seconds before starting frontend...
timeout /t 5 /nobreak

:: Запуск frontend
echo Starting frontend on port 3006...
cd /d D:\Avtoreger\data\zenka\KZ2\aaa\app\frontend
set PORT=3007
start "Frontend" cmd /k npm start

echo Gyat Panel startup complete!
