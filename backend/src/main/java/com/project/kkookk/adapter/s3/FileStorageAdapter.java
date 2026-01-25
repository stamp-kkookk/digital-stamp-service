package com.project.kkookk.adapter.s3;

import com.project.kkookk.common.exception.FileStorageException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileStorageAdapter {

    private final Path storageLocation;

    public FileStorageAdapter(@Value("${app.storage.local-path}") String storagePath) {
        this.storageLocation = Paths.get(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new FileStorageException();
        }
    }

    public void upload(String path, byte[] data, String contentType) {
        Path targetLocation = this.storageLocation.resolve(path);
        try {
            Files.createDirectories(targetLocation.getParent());
            Files.write(targetLocation, data);
        } catch (IOException e) {
            log.error("Failed to upload file to local storage. Path: {}", path, e);
            throw new FileStorageException();
        }
    }

    public boolean doesObjectExist(String path) {
        Path targetLocation = this.storageLocation.resolve(path);
        return Files.exists(targetLocation);
    }

    public URL getPresignedUrl(String path) {
        // 로컬 저장소에서는 presigned URL 대신, 파일을 서빙할 로컬 엔드포인트 경로를 반환합니다.
        // 실제 URL 객체 대신 경로를 나타내는 URL을 생성하여 반환합니다.
        // 이 URL은 나중에 FileController에서 처리됩니다.
        try {
            // This is a bit of a hack. We construct a URL-like string that the controller can
            // redirect to.
            // A better approach might be to return a URI or just the path string.
            // For now, we assume the server runs on localhost:8080
            return new URL("http://localhost:8080/files/" + path);
        } catch (MalformedURLException e) {
            log.error("Failed to create file URL for path: {}", path, e);
            throw new FileStorageException();
        }
    }
}
