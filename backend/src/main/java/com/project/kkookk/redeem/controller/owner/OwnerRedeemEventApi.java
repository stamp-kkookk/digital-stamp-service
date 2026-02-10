package com.project.kkookk.redeem.controller.owner;

import com.project.kkookk.global.dto.PageResponse;
import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.redeem.controller.owner.dto.RedeemEventResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Owner Redeem Event", description = "사장님 리딤 이벤트 조회 API")
@SecurityRequirement(name = "bearerAuth")
public interface OwnerRedeemEventApi {

    @Operation(
            summary = "리딤 사용 완료 내역 조회",
            description = "해당 매장의 리딤 사용 완료(COMPLETED + SUCCESS) 내역을 페이징 조회합니다.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(
                                schema =
                                        @Schema(
                                                description = "페이지 응답",
                                                example =
                                                        """
                        {
                            "content": [],
                            "pageNumber": 0,
                            "pageSize": 20,
                            "totalElements": 0,
                            "totalPages": 0,
                            "isLast": true
                        }
                        """),
                                array =
                                        @ArraySchema(
                                                schema =
                                                        @Schema(
                                                                implementation =
                                                                        RedeemEventResponse
                                                                                .class)))),
        @ApiResponse(
                responseCode = "404",
                description = "매장을 찾을 수 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<PageResponse<RedeemEventResponse>> getRedeemEvents(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "페이지 번호 (0-based)", example = "0")
                    @RequestParam(defaultValue = "0")
                    int page,
            @Parameter(description = "페이지 크기", example = "20") @RequestParam(defaultValue = "20")
                    int size,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
