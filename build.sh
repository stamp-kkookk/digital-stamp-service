#!/bin/bash
set -e

echo "===================================="
echo "KKOOKK Build Script"
echo "===================================="
echo ""

echo "[1/3] Building client (React)..."
cd client
npm install
npm run build
cd ..
echo "Client build completed!"
echo ""

echo "[2/3] Building server (Spring Boot)..."
cd server
./gradlew clean bootJar
cd ..
echo "Server build completed!"
echo ""

echo "[3/3] Build artifacts location:"
echo "  - JAR file: server/build/libs/kkookk-server-0.0.1-SNAPSHOT.jar"
echo ""
echo "===================================="
echo "Build completed successfully!"
echo "===================================="
echo ""
echo "To run the application:"
echo "  java -jar server/build/libs/kkookk-server-0.0.1-SNAPSHOT.jar"
echo ""
