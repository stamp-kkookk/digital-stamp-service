package com.kkookk.store.dto;

import com.kkookk.store.entity.Store;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class StoreResponse {

    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String address;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StoreResponse from(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .ownerId(store.getOwner().getId())
                .name(store.getName())
                .description(store.getDescription())
                .address(store.getAddress())
                .phoneNumber(store.getPhoneNumber())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}
