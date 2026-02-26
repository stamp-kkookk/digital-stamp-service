package com.project.kkookk.global.image;

import com.project.kkookk.global.config.ImageProcessingProperties;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageProcessingService {

    private final ImageStorageService imageStorageService;
    private final ImageProcessingProperties properties;

    /**
     * 이미지를 리사이즈 + 썸네일 생성 후 저장한다.
     *
     * @param keyPrefix 저장 경로 접두사 (예: "stores/icons")
     * @param inputStream 원본 이미지 바이너리 스트림
     * @return 저장된 메인 이미지의 key (예: "stores/icons/uuid.jpg")
     */
    public String processAndStore(String keyPrefix, InputStream inputStream) {
        try {
            byte[] originalBytes = inputStream.readAllBytes();
            String uuid = UUID.randomUUID().toString();
            String mainKey = keyPrefix + "/" + uuid + ".jpg";
            String thumbKey = getThumbnailKey(mainKey);

            byte[] resized =
                    resize(
                            originalBytes,
                            properties.getMaxWidth(),
                            properties.getMaxHeight(),
                            properties.getQuality());
            byte[] thumbnail =
                    resize(
                            originalBytes,
                            properties.getThumbnailWidth(),
                            properties.getThumbnailHeight(),
                            properties.getThumbnailQuality());

            imageStorageService.upload(mainKey, new ByteArrayInputStream(resized), "image/jpeg");
            imageStorageService.upload(thumbKey, new ByteArrayInputStream(thumbnail), "image/jpeg");

            log.debug(
                    "이미지 처리 완료: main={} ({} bytes), thumb={} ({} bytes)",
                    mainKey,
                    resized.length,
                    thumbKey,
                    thumbnail.length);

            return mainKey;
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    /** 메인 키로부터 썸네일 키를 파생한다. 예: "stores/icons/uuid.jpg" → "stores/icons/uuid_thumb.jpg" */
    public String getThumbnailKey(String mainKey) {
        int dotIndex = mainKey.lastIndexOf('.');
        return mainKey.substring(0, dotIndex) + "_thumb" + mainKey.substring(dotIndex);
    }

    /** 메인 이미지와 썸네일을 함께 삭제한다. */
    public void deleteWithThumbnail(String mainKey) {
        imageStorageService.delete(mainKey);
        imageStorageService.delete(getThumbnailKey(mainKey));
    }

    /** 이미지에 접근할 수 있는 URL을 반환한다. */
    public String getUrl(String key) {
        return imageStorageService.getUrl(key);
    }

    /** 썸네일 URL을 반환한다. */
    public String getThumbnailUrl(String mainKey) {
        return imageStorageService.getUrl(getThumbnailKey(mainKey));
    }

    private byte[] resize(byte[] original, int maxWidth, int maxHeight, double quality)
            throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(original))
                .size(maxWidth, maxHeight)
                .outputFormat("jpg")
                .outputQuality(quality)
                .toOutputStream(output);
        return output.toByteArray();
    }
}
