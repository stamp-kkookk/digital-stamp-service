package com.project.kkookk;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(
        properties = {
            "app.storage.local-path=build/test-storage",
            "app.qr-base-url=http://localhost:8080/c/s/"
        })
class KkookkApplicationTests {

    @Test
    void contextLoads() {}
}
