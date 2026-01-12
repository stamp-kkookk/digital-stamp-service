package com.kkookk.common.service;

import com.kkookk.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadPath);
            log.info("Upload directory created/verified: {}", this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(
                    "FILE001",
                    "파일이 비어있습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 파일명 정리
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // 보안: 파일명에 ..이 포함되어 있으면 거부
        if (originalFilename.contains("..")) {
            throw new BusinessException(
                    "FILE002",
                    "잘못된 파일명입니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 파일 확장자 확인
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        // 고유 파일명 생성
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored: {} (original: {})", fileName, originalFilename);
            return fileName;
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new BusinessException(
                    "FILE003",
                    "파일 저장에 실패했습니다.",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    public Path loadFile(String fileName) {
        return uploadPath.resolve(fileName).normalize();
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", fileName);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileName, e);
        }
    }
}
