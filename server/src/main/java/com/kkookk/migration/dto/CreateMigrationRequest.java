package com.kkookk.migration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMigrationRequest {

    @NotNull(message = "매장 ID는 필수입니다")
    private Long storeId;

    @NotBlank(message = "사진 파일명은 필수입니다")
    private String photoFileName;
}
