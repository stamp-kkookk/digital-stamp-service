package com.kkookk.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // SPA 지원: 모든 경로에서 index.html 반환 (API 경로 제외)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // API 요청과 Swagger UI는 제외
                        if (resourcePath.startsWith("api/") ||
                            resourcePath.startsWith("swagger-ui") ||
                            resourcePath.startsWith("v3/api-docs") ||
                            resourcePath.startsWith("h2-console")) {
                            return null;
                        }

                        // 파일이 존재하면 반환
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 그 외는 index.html 반환 (SPA 라우팅)
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
