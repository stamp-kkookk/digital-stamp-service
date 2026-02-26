package com.project.kkookk.global.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import com.project.kkookk.global.config.ImageStorageProperties;
import com.project.kkookk.global.exception.BusinessException;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {

    @Mock private S3Client s3Client;

    @Mock private ImageStorageProperties properties;

    @InjectMocks private S3StorageService s3StorageService;

    private static final String BUCKET = "test-bucket";
    private static final String REGION = "ap-northeast-2";

    @Test
    @DisplayName("upload는 S3에 PutObject 요청을 보낸다")
    void upload_callsPutObject() {
        // given
        given(properties.getS3Bucket()).willReturn(BUCKET);
        InputStream input = new ByteArrayInputStream("image-data".getBytes());

        given(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .willReturn(PutObjectResponse.builder().build());

        // when
        String key = s3StorageService.upload("stores/icons/test.jpg", input, "image/jpeg");

        // then
        assertThat(key).isEqualTo("stores/icons/test.jpg");

        ArgumentCaptor<PutObjectRequest> captor = ArgumentCaptor.forClass(PutObjectRequest.class);
        then(s3Client).should().putObject(captor.capture(), any(RequestBody.class));

        PutObjectRequest captured = captor.getValue();
        assertThat(captured.bucket()).isEqualTo(BUCKET);
        assertThat(captured.key()).isEqualTo("stores/icons/test.jpg");
        assertThat(captured.contentType()).isEqualTo("image/jpeg");
    }

    @Test
    @DisplayName("upload 실패 시 BusinessException을 던진다")
    void upload_failure_throwsBusinessException() {
        // given
        given(properties.getS3Bucket()).willReturn(BUCKET);
        given(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .willThrow(S3Exception.builder().message("Access Denied").build());
        InputStream input = new ByteArrayInputStream("data".getBytes());

        // when & then
        assertThatThrownBy(
                        () -> s3StorageService.upload("stores/icons/test.jpg", input, "image/jpeg"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("download는 S3에 GetObject 요청을 보낸다")
    void download_callsGetObject() {
        // given
        given(properties.getS3Bucket()).willReturn(BUCKET);
        // S3Client.getObject returns ResponseInputStream, mock it
        given(s3Client.getObject(any(GetObjectRequest.class)))
                .willThrow(S3Exception.builder().message("Not Found").build());

        // when & then
        assertThatThrownBy(() -> s3StorageService.download("stores/icons/test.jpg"))
                .isInstanceOf(BusinessException.class);

        ArgumentCaptor<GetObjectRequest> captor = ArgumentCaptor.forClass(GetObjectRequest.class);
        then(s3Client).should().getObject(captor.capture());

        GetObjectRequest captured = captor.getValue();
        assertThat(captured.bucket()).isEqualTo(BUCKET);
        assertThat(captured.key()).isEqualTo("stores/icons/test.jpg");
    }

    @Test
    @DisplayName("delete는 S3에 DeleteObject 요청을 보낸다")
    void delete_callsDeleteObject() {
        // given
        given(properties.getS3Bucket()).willReturn(BUCKET);

        // when
        s3StorageService.delete("stores/icons/test.jpg");

        // then
        ArgumentCaptor<DeleteObjectRequest> captor =
                ArgumentCaptor.forClass(DeleteObjectRequest.class);
        then(s3Client).should().deleteObject(captor.capture());

        DeleteObjectRequest captured = captor.getValue();
        assertThat(captured.bucket()).isEqualTo(BUCKET);
        assertThat(captured.key()).isEqualTo("stores/icons/test.jpg");
    }

    @Test
    @DisplayName("delete 실패 시 BusinessException을 던진다")
    void delete_failure_throwsBusinessException() {
        // given
        given(properties.getS3Bucket()).willReturn(BUCKET);
        given(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .willThrow(S3Exception.builder().message("Error").build());

        // when & then
        assertThatThrownBy(() -> s3StorageService.delete("stores/icons/test.jpg"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("getUrl은 CloudFront 도메인이 있으면 CloudFront URL을 반환한다")
    void getUrl_withCloudFront_returnsCloudFrontUrl() {
        // given
        given(properties.getCloudFrontDomain()).willReturn("cdn.example.com");

        // when
        String url = s3StorageService.getUrl("stores/icons/test.jpg");

        // then
        assertThat(url).isEqualTo("https://cdn.example.com/stores/icons/test.jpg");
    }

    @Test
    @DisplayName("getUrl은 CloudFront 도메인이 없으면 S3 URL을 반환한다")
    void getUrl_withoutCloudFront_returnsS3Url() {
        // given
        given(properties.getCloudFrontDomain()).willReturn(null);
        given(properties.getS3Bucket()).willReturn(BUCKET);
        given(properties.getS3Region()).willReturn(REGION);

        // when
        String url = s3StorageService.getUrl("stores/icons/test.jpg");

        // then
        assertThat(url)
                .isEqualTo(
                        "https://test-bucket.s3.ap-northeast-2.amazonaws.com/stores/icons/test.jpg");
    }

    @Test
    @DisplayName("getUrl은 빈 문자열 CloudFront 도메인에도 S3 URL을 반환한다")
    void getUrl_withBlankCloudFront_returnsS3Url() {
        // given
        given(properties.getCloudFrontDomain()).willReturn("  ");
        given(properties.getS3Bucket()).willReturn(BUCKET);
        given(properties.getS3Region()).willReturn(REGION);

        // when
        String url = s3StorageService.getUrl("stores/icons/test.jpg");

        // then
        assertThat(url).startsWith("https://test-bucket.s3.");
    }
}
