package com.project.kkookk.global.image;

import java.io.InputStream;

public interface ImageStorageService {

    String upload(String key, InputStream inputStream, String contentType);

    /** 저장된 이미지를 바이너리 스트림으로 반환한다. */
    InputStream download(String key);

    /** 저장된 이미지를 삭제한다. */
    void delete(String key);

    /** 이미지에 접근할 수 있는 URL을 반환한다. */
    String getUrl(String key);
}
