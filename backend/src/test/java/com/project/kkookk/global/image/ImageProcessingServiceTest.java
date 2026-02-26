package com.project.kkookk.global.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.times;

import com.project.kkookk.global.config.ImageProcessingProperties;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImageProcessingServiceTest {

    @Mock private ImageStorageService imageStorageService;

    private ImageProcessingService imageProcessingService;

    @BeforeEach
    void setUp() {
        ImageProcessingProperties properties =
                new ImageProcessingProperties(800, 800, 0.8, 200, 200, 0.7);
        imageProcessingService = new ImageProcessingService(imageStorageService, properties);
    }

    private InputStream createTestImage(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(0, 0, width, height);
        g.dispose();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return new ByteArrayInputStream(out.toByteArray());
    }

    @Test
    @DisplayName("이미지를 리사이즈 + 썸네일 생성 후 저장한다")
    void processAndStore_uploadsMainAndThumbnail() throws Exception {
        // given
        InputStream input = createTestImage(1000, 800);
        given(imageStorageService.upload(any(), any(), any()))
                .willAnswer(inv -> inv.getArgument(0));

        // when
        String mainKey = imageProcessingService.processAndStore("stores/icons", input);

        // then
        assertThat(mainKey).startsWith("stores/icons/").endsWith(".jpg");
        then(imageStorageService).should(times(2)).upload(any(), any(), eq("image/jpeg"));
    }

    @Test
    @DisplayName("리사이즈된 메인 이미지가 설정된 최대 크기 이하이다")
    void processAndStore_mainImageResized() throws Exception {
        // given
        InputStream input = createTestImage(2000, 1600);
        ArgumentCaptor<InputStream> streamCaptor = ArgumentCaptor.forClass(InputStream.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        given(imageStorageService.upload(any(), any(), any()))
                .willAnswer(inv -> inv.getArgument(0));

        // when
        imageProcessingService.processAndStore("stores/icons", input);

        // then
        then(imageStorageService)
                .should(times(2))
                .upload(keyCaptor.capture(), streamCaptor.capture(), any());

        // 첫 번째 호출 = 메인 이미지
        byte[] mainBytes = streamCaptor.getAllValues().get(0).readAllBytes();
        BufferedImage mainImage = ImageIO.read(new ByteArrayInputStream(mainBytes));
        assertThat(mainImage.getWidth()).isLessThanOrEqualTo(800);
        assertThat(mainImage.getHeight()).isLessThanOrEqualTo(800);
    }

    @Test
    @DisplayName("썸네일이 설정된 크기 이하로 생성된다")
    void processAndStore_thumbnailResized() throws Exception {
        // given
        InputStream input = createTestImage(1000, 800);
        ArgumentCaptor<InputStream> streamCaptor = ArgumentCaptor.forClass(InputStream.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        given(imageStorageService.upload(any(), any(), any()))
                .willAnswer(inv -> inv.getArgument(0));

        // when
        imageProcessingService.processAndStore("stores/icons", input);

        // then
        then(imageStorageService)
                .should(times(2))
                .upload(keyCaptor.capture(), streamCaptor.capture(), any());

        // 두 번째 호출 = 썸네일
        String thumbKey = keyCaptor.getAllValues().get(1);
        assertThat(thumbKey).contains("_thumb");

        byte[] thumbBytes = streamCaptor.getAllValues().get(1).readAllBytes();
        BufferedImage thumbImage = ImageIO.read(new ByteArrayInputStream(thumbBytes));
        assertThat(thumbImage.getWidth()).isLessThanOrEqualTo(200);
        assertThat(thumbImage.getHeight()).isLessThanOrEqualTo(200);
    }

    @Test
    @DisplayName("리사이즈된 이미지가 원본보다 작다")
    void processAndStore_outputSmallerThanOriginal() throws Exception {
        // given
        ByteArrayOutputStream originalOut = new ByteArrayOutputStream();
        BufferedImage original = new BufferedImage(2000, 1600, BufferedImage.TYPE_INT_RGB);
        ImageIO.write(original, "png", originalOut);
        byte[] originalBytes = originalOut.toByteArray();

        ArgumentCaptor<InputStream> streamCaptor = ArgumentCaptor.forClass(InputStream.class);
        given(imageStorageService.upload(any(), any(), any()))
                .willAnswer(inv -> inv.getArgument(0));

        // when
        imageProcessingService.processAndStore(
                "stores/icons", new ByteArrayInputStream(originalBytes));

        // then
        then(imageStorageService).should(times(2)).upload(any(), streamCaptor.capture(), any());
        byte[] mainBytes = streamCaptor.getAllValues().get(0).readAllBytes();
        assertThat(mainBytes.length).isLessThan(originalBytes.length);
    }

    @Test
    @DisplayName("getThumbnailKey는 _thumb 접미사를 추가한다")
    void getThumbnailKey_appendsThumbSuffix() {
        String thumbKey = imageProcessingService.getThumbnailKey("stores/icons/abc.jpg");

        assertThat(thumbKey).isEqualTo("stores/icons/abc_thumb.jpg");
    }

    @Test
    @DisplayName("deleteWithThumbnail은 메인과 썸네일을 모두 삭제한다")
    void deleteWithThumbnail_deletesBoth() {
        // when
        imageProcessingService.deleteWithThumbnail("stores/icons/abc.jpg");

        // then
        then(imageStorageService).should().delete("stores/icons/abc.jpg");
        then(imageStorageService).should().delete("stores/icons/abc_thumb.jpg");
    }

    @Test
    @DisplayName("getUrl은 ImageStorageService에 위임한다")
    void getUrl_delegates() {
        given(imageStorageService.getUrl("stores/icons/abc.jpg"))
                .willReturn("/storage/stores/icons/abc.jpg");

        String url = imageProcessingService.getUrl("stores/icons/abc.jpg");

        assertThat(url).isEqualTo("/storage/stores/icons/abc.jpg");
    }

    @Test
    @DisplayName("getThumbnailUrl은 썸네일 키로 URL을 반환한다")
    void getThumbnailUrl_returnsThumbnailUrl() {
        given(imageStorageService.getUrl("stores/icons/abc_thumb.jpg"))
                .willReturn("/storage/stores/icons/abc_thumb.jpg");

        String url = imageProcessingService.getThumbnailUrl("stores/icons/abc.jpg");

        assertThat(url).isEqualTo("/storage/stores/icons/abc_thumb.jpg");
    }
}
