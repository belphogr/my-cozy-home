@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "node_modules\vite" (
  echo 请先在本目录运行 npm.cmd install 安装依赖。
  pause
  exit /b 1
)
echo 小屋地址：http://127.0.0.1:5173/
echo 请保持此窗口开启，按 Ctrl+C 可以停止。
call npm.cmd run dev
pause
