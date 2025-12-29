@echo off
echo ===================================================
echo   Tikovia Banner AI - BUILD EXE
echo ===================================================
echo.

echo [INFO] Installing Electron dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit
)

echo [INFO] Building the application...
echo This may take a few minutes (downloading electron binaries)...
call npm run electron:build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit
)

echo.
echo ===================================================
echo   BUILD SUCCESSFUL!
echo ===================================================
echo.
echo You can find your SETUP file in:
echo   dist_electron\
echo.
echo Opening the folder for you...
explorer "dist_electron"
pause
