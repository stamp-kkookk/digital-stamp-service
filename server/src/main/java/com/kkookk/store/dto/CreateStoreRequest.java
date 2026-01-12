package com.kkookk.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateStoreRequest {

    @NotBlank(message = "매장명은 필수입니다.")
    @Size(max = 200, message = "매장명은 200자를 초과할 수 없습니다.")
    private String name;

    @Size(max = 500, message = "매장 설명은 500자를 초과할 수 없습니다.")
    private String description;

    @Size(max = 500, message = "주소는 500자를 초과할 수 없습니다.")
    private String address;

    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다.")
    private String phoneNumber;
}
