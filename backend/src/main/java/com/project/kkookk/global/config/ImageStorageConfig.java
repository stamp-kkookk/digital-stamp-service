package com.project.kkookk.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties({ImageStorageProperties.class, ImageProcessingProperties.class})
public class ImageStorageConfig {

    @Bean
    @Profile("prod")
    public S3Client s3Client(ImageStorageProperties properties) {
        return S3Client.builder().region(Region.of(properties.getS3Region())).build();
    }
}
