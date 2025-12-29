@echo off
setlocal
echo ===================================================
echo   Tikovia Agency Banner AI - Setup & Start
echo ===================================================
echo.

REM 1. Check if Node.js is already installed
where node >nul 2>nul
if %errorlevel% equ 0 (
    goto :FoundNode
)

echo [WARNING] Node.js is NOT found on this computer.
echo.
echo ===================================================
echo   ATTEMPTING AUTOMATIC INSTALLATION...
echo   (A window may pop up asking for permission - Click Yes)
echo ===================================================
echo.

REM 2. Try to install using Window Package Manager (winget)
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
if %errorlevel% neq 0 (
    goto :InstallFail
)

echo.
echo [SUCCESS] Node.js has been installed!
echo.
echo ***************************************************************
echo *  IMPORTANT:                                                 *
echo *  You MUST CLOSE this window and DOUBLE-CLICK the file again *
echo *  for the changes to take effect.                            *
echo ***************************************************************
echo.
pause
exit

:InstallFail
echo.
echo [ERROR] Automatic installation failed.
echo.
echo You must install it manually:
echo 1. Go to: https://nodejs.org/
echo 2. Download and install the "LTS" version.
echo 3. Come back here and run this script again.
echo.
pause
exit

:FoundNode
echo [OK] Node.js is installed.
echo.

REM 3. Check and Install Dependencies
if not exist "node_modules" (
    echo [INFO] Dependencies missing. Installing... (This takes 1-2 mins)
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Check your internet.
        pause
        exit
    )
    echo [OK] Dependencies installed.
) else (
    echo [INFO] Dependencies ready.
)

echo.
echo ===================================================
echo   STARTING APP...
echo   Wait for the browser to open http://localhost:3000
echo ===================================================
echo.

call npm run dev
pause
