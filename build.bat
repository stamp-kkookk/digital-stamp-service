@echo off
echo ====================================
echo KKOOKK Build Script (Windows)
echo ====================================
echo.

echo [1/3] Building client (React)...
cd client
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Client build failed
    exit /b %errorlevel%
)
cd ..
echo Client build completed!
echo.

echo [2/3] Building server (Spring Boot)...
cd server
call gradlew.bat clean bootJar
if %errorlevel% neq 0 (
    echo ERROR: Server build failed
    exit /b %errorlevel%
)
cd ..
echo Server build completed!
echo.

echo [3/3] Build artifacts location:
echo   - JAR file: server\build\libs\kkookk-server-0.0.1-SNAPSHOT.jar
echo.
echo ====================================
echo Build completed successfully!
echo ====================================
echo.
echo To run the application:
echo   java -jar server\build\libs\kkookk-server-0.0.1-SNAPSHOT.jar
echo.
