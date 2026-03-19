@echo off
echo === Sukinime Scraper ===
cd /d "%~dp0scraper"
call venv\Scripts\activate.bat
python main.py
pause
