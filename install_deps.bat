@echo off
echo Installing frontend dependencies...
npm install
echo.
echo Installing backend dependencies...
cd backend
IF EXIST composer.phar (
    C:\xampp\php\php.exe composer.phar install
) ELSE (
    composer install
)
echo.
echo Done!
pause
