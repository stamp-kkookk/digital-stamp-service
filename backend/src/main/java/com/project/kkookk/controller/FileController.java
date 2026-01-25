package com.project.kkookk.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

@Slf4j
@Tag(name = "File API", description = "파일 서빙 API")
@RestController
public class FileController {

    private final Path fileStorageLocation;

    public FileController(@Value("${app.storage.local-path}") String storagePath) {
        this.fileStorageLocation = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @Operation(summary = "로컬 저장소 파일 조회", description = "저장된 QR 코드 이미지 등의 파일을 조회합니다.")
    @GetMapping("/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String filePathString =
                (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        // Extract the path after "/files/"
        String relativePath = filePathString.substring("/files/".length());

        try {
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // You might want to determine the content type dynamically
                String contentType = MediaType.IMAGE_PNG_VALUE;

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("File not found or not readable: {}", relativePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            log.error("Could not create URL for the file path: {}", relativePath, ex);
            return ResponseEntity.badRequest().build();
        }
    }
}
