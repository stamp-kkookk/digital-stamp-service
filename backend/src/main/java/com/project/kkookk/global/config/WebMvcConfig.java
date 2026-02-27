package com.project.kkookk.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("!prod")
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.storage.local-path:./storage}")
    private String localPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/storage/**").addResourceLocations("file:" + localPath + "/");
    }
}
