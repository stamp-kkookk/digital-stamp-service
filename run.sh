#!/bin/bash

echo "===================================="
echo "KKOOKK Application Runner"
echo "===================================="
echo ""

JAR_FILE="server/build/libs/kkookk-server-0.0.1-SNAPSHOT.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "ERROR: JAR file not found!"
    echo "Please run build.sh first."
    exit 1
fi

echo "Starting application..."
echo "Access at: http://localhost:8080"
echo ""
java -jar "$JAR_FILE"
