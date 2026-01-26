package com.project.kkookk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class KkookkApplication {

    public static void main(String[] args) {
        SpringApplication.run(KkookkApplication.class, args);
    }
}
