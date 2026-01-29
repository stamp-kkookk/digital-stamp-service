package com.project.kkookk;

import com.project.kkookk.common.limit.config.FailureLimitProperties;
import com.project.kkookk.global.config.JwtProperties;
import com.project.kkookk.otp.config.OtpProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@EnableConfigurationProperties({
    JwtProperties.class,
    OtpProperties.class,
    FailureLimitProperties.class
})
@SpringBootApplication
public class KkookkApplication {

    public static void main(String[] args) {
        SpringApplication.run(KkookkApplication.class, args);
    }
}
