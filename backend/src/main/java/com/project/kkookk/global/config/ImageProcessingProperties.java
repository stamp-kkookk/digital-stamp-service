package com.project.kkookk.global.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "app.image")
public class ImageProcessingProperties {

    private final int maxWidth;
    private final int maxHeight;
    private final double quality;
    private final int thumbnailWidth;
    private final int thumbnailHeight;
    private final double thumbnailQuality;
}
