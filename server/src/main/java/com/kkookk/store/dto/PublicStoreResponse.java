package com.kkookk.store.dto;

import com.kkookk.store.entity.Store;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PublicStoreResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String phoneNumber;

    public static PublicStoreResponse from(Store store) {
        return PublicStoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .description(store.getDescription())
                .address(store.getAddress())
                .phoneNumber(store.getPhoneNumber())
                .build();
    }
}
