package com.project.kkookk.global.image;

import com.project.kkookk.global.config.ImageStorageProperties;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class S3StorageService implements ImageStorageService {

    private final S3Client s3Client;
    private final ImageStorageProperties properties;

    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(properties.getS3Bucket())
                            .key(key)
                            .contentType(contentType)
                            .build();
            s3Client.putObject(request, RequestBody.fromBytes(bytes));
            log.debug("S3 업로드 완료: s3://{}/{}", properties.getS3Bucket(), key);
            return key;
        } catch (Exception e) {
            log.error("S3 업로드 실패: key={}", key, e);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public InputStream download(String key) {
        try {
            GetObjectRequest request =
                    GetObjectRequest.builder().bucket(properties.getS3Bucket()).key(key).build();
            return s3Client.getObject(request);
        } catch (Exception e) {
            log.error("S3 다운로드 실패: key={}", key, e);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public void delete(String key) {
        try {
            DeleteObjectRequest request =
                    DeleteObjectRequest.builder().bucket(properties.getS3Bucket()).key(key).build();
            s3Client.deleteObject(request);
            log.debug("S3 삭제 완료: s3://{}/{}", properties.getS3Bucket(), key);
        } catch (Exception e) {
            log.error("S3 삭제 실패: key={}", key, e);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    @Override
    public String getUrl(String key) {
        String domain = properties.getCloudFrontDomain();
        if (domain != null && !domain.isBlank()) {
            return "https://" + domain + "/" + key;
        }
        return "https://"
                + properties.getS3Bucket()
                + ".s3."
                + properties.getS3Region()
                + ".amazonaws.com/"
                + key;
    }
}
