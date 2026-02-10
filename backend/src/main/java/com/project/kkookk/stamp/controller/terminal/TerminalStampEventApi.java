package com.project.kkookk.stamp.controller.terminal;

import com.project.kkookk.global.dto.PageResponse;
import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.TerminalPrincipal;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
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

@Tag(name = "Terminal Stamp Event", description = "터미널 스탬프 적립 내역 조회 API")
@SecurityRequirement(name = "bearerAuth")
public interface TerminalStampEventApi {

    @Operation(summary = "스탬프 적립 내역 조회", description = "해당 매장의 스탬프 적립 내역을 페이징 조회합니다.")
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
                                                                        StampEventResponse
                                                                                .class)))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "매장 접근 권한 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<PageResponse<StampEventResponse>> getStampEvents(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "페이지 번호 (0-based)", example = "0")
                    @RequestParam(defaultValue = "0")
                    int page,
            @Parameter(description = "페이지 크기", example = "20") @RequestParam(defaultValue = "20")
                    int size,
            @Parameter(hidden = true) @AuthenticationPrincipal TerminalPrincipal principal);
}
