package com.project.kkookk.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ImageStorageProperties.class, ImageProcessingProperties.class})
public class ImageStorageConfig {}
