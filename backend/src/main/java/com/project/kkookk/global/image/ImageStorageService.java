package com.project.kkookk.global.image;

import java.io.InputStream;

public interface ImageStorageService {

    /**
     * 이미지를 저장하고, 저장된 경로(key)를 반환한다.
     *
     * @param key 저장 경로 (예: "stores/123/icon.webp")
     * @param inputStream 이미지 바이너리 스트림
     * @param contentType MIME 타입 (예: "image/webp")
     * @return 저장된 key
     */
    String upload(String key, InputStream inputStream, String contentType);

    /** 저장된 이미지를 바이너리 스트림으로 반환한다. */
    InputStream download(String key);

    /** 저장된 이미지를 삭제한다. */
    void delete(String key);

    /** 이미지에 접근할 수 있는 URL을 반환한다. */
    String getUrl(String key);
}
