@echo off
echo ====================================
echo KKOOKK Application Runner (Windows)
echo ====================================
echo.

set JAR_FILE=server\build\libs\kkookk-server-0.0.1-SNAPSHOT.jar

if not exist "%JAR_FILE%" (
    echo ERROR: JAR file not found!
    echo Please run build.bat first.
    exit /b 1
)

echo Starting application...
echo Access at: http://localhost:8080
echo.
java -jar "%JAR_FILE%"
