package com.project.kkookk.global.image;

import com.project.kkookk.global.config.ImageStorageProperties;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("!prod")
@RequiredArgsConstructor
public class LocalFileStorageService implements ImageStorageService {

    private final ImageStorageProperties properties;

    private Path rootPath;

    @PostConstruct
    void init() {
        this.rootPath = Path.of(properties.getLocalPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootPath);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        try {
            Path targetPath = resolve(key);
            Files.createDirectories(targetPath.getParent());
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("이미지 저장 완료: {}", key);
            return key;
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public InputStream download(String key) {
        try {
            Path filePath = resolve(key);
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Path filePath = resolve(key);
            Files.deleteIfExists(filePath);
            log.debug("이미지 삭제 완료: {}", key);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public String getUrl(String key) {
        return "/storage/" + key;
    }

    private Path resolve(String key) {
        Path resolved = rootPath.resolve(key).normalize();
        if (!resolved.startsWith(rootPath)) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
        return resolved;
    }
}
