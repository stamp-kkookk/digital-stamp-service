package com.project.kkookk.global.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.project.kkookk.global.config.ImageStorageProperties;
import com.project.kkookk.global.exception.BusinessException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalFileStorageServiceTest {

    @TempDir Path tempDir;

    private LocalFileStorageService storageService;

    @BeforeEach
    void setUp() {
        ImageStorageProperties properties = new ImageStorageProperties(tempDir.toString());
        storageService = new LocalFileStorageService(properties);
        storageService.init();
    }

    @Test
    @DisplayName("이미지를 업로드하면 key를 반환한다")
    void upload_returnsKey() {
        InputStream input = new ByteArrayInputStream("fake-image-data".getBytes());

        String key = storageService.upload("stores/1/icon.webp", input, "image/webp");

        assertThat(key).isEqualTo("stores/1/icon.webp");
    }

    @Test
    @DisplayName("업로드한 이미지 파일이 디스크에 존재한다")
    void upload_fileExistsOnDisk() {
        InputStream input = new ByteArrayInputStream("fake-image-data".getBytes());

        storageService.upload("stores/1/icon.webp", input, "image/webp");

        assertThat(tempDir.resolve("stores/1/icon.webp")).exists();
    }

    @Test
    @DisplayName("업로드한 이미지를 다운로드하면 동일한 데이터를 반환한다")
    void download_returnsSameData() throws IOException {
        byte[] originalData = "fake-image-data".getBytes();
        storageService.upload(
                "test/image.png", new ByteArrayInputStream(originalData), "image/png");

        InputStream downloaded = storageService.download("test/image.png");

        assertThat(downloaded.readAllBytes()).isEqualTo(originalData);
    }

    @Test
    @DisplayName("존재하지 않는 이미지를 다운로드하면 예외가 발생한다")
    void download_notFound_throwsException() {
        assertThatThrownBy(() -> storageService.download("nonexistent.png"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("이미지를 삭제하면 파일이 사라진다")
    void delete_removesFile() {
        storageService.upload(
                "test/delete-me.png", new ByteArrayInputStream("data".getBytes()), "image/png");

        storageService.delete("test/delete-me.png");

        assertThat(tempDir.resolve("test/delete-me.png")).doesNotExist();
    }

    @Test
    @DisplayName("존재하지 않는 이미지를 삭제해도 예외가 발생하지 않는다")
    void delete_nonexistent_doesNotThrow() {
        storageService.delete("nonexistent.png");
    }

    @Test
    @DisplayName("getUrl은 /storage/ 접두사를 붙인 경로를 반환한다")
    void getUrl_returnsStoragePrefixedPath() {
        String url = storageService.getUrl("stores/1/icon.webp");

        assertThat(url).isEqualTo("/storage/stores/1/icon.webp");
    }

    @Test
    @DisplayName("경로 탐색 공격(../)을 시도하면 예외가 발생한다")
    void upload_pathTraversal_throwsException() {
        InputStream input = new ByteArrayInputStream("malicious".getBytes());

        assertThatThrownBy(() -> storageService.upload("../../etc/passwd", input, "text/plain"))
                .isInstanceOf(BusinessException.class);
    }
}
