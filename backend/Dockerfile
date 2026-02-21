FROM amazoncorretto:17-alpine
WORKDIR /app
COPY build/libs/kkookk-*.jar app.jar
ENV JAVA_OPTS="-Xmx384m -Xms256m"
EXPOSE 8080 7070
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
