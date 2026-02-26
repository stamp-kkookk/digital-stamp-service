package com.project.kkookk.store.controller.owner;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.owner.controller.config.WithMockOwner;
import com.project.kkookk.store.controller.owner.dto.StoreCreateRequest;
import com.project.kkookk.store.controller.owner.dto.StoreResponse;
import com.project.kkookk.store.controller.owner.dto.StoreUpdateRequest;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.service.StoreService;
import java.time.LocalDateTime;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockPart;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(
        controllers = StoreController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import(TestSecurityConfig.class)
@WithMockOwner(ownerId = 1L, email = "owner@example.com") // Mock Owner ID 1
class StoreControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private StoreService storeService;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired private ObjectMapper objectMapper;

    @Autowired private WebApplicationContext context;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    private static final Long OWNER_ID = 1L;
    private static final Long STORE_ID = 1L;

    private StoreResponse createStoreResponse(
            String name, StoreStatus status, Long ownerAccountId) {
        return new StoreResponse(
                STORE_ID,
                name,
                "주소",
                "02-1234-5678",
                null,
                null,
                null,
                null,
                status,
                LocalDateTime.now(),
                LocalDateTime.now(),
                ownerAccountId);
    }

    private MockPart jsonPart(String name, Object value) throws Exception {
        MockPart part = new MockPart(name, objectMapper.writeValueAsBytes(value));
        part.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return part;
    }

    @Test
    @DisplayName("매장 생성 성공 - 201 Created")
    void createStore_Success() throws Exception {
        // given
        StoreCreateRequest request =
                new StoreCreateRequest("새 매장", "주소", "02-1234-5678", null, null);
        StoreResponse response = createStoreResponse("새 매장", StoreStatus.DRAFT, OWNER_ID);
        given(storeService.createStore(anyLong(), any(StoreCreateRequest.class), any()))
                .willReturn(response);

        // when & then
        mockMvc.perform(multipart("/api/owner/stores").part(jsonPart("data", request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(STORE_ID))
                .andExpect(jsonPath("$.name").value("새 매장"));
    }

    @Test
    @DisplayName("매장 생성 실패 - 이름 누락 - 400 Bad Request")
    void createStore_Fail_InvalidRequest() throws Exception {
        // given
        StoreCreateRequest request = new StoreCreateRequest("", "주소", "02-1234-5678", null, null);

        // when & then
        mockMvc.perform(multipart("/api/owner/stores").part(jsonPart("data", request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("매장 목록 조회 성공 - 200 OK")
    void getStores_Success() throws Exception {
        // given
        StoreResponse response = createStoreResponse("내 매장", StoreStatus.DRAFT, OWNER_ID);
        given(storeService.getStores(OWNER_ID)).willReturn(Collections.singletonList(response));

        // when & then
        mockMvc.perform(get("/api/owner/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(STORE_ID));
    }

    @Test
    @DisplayName("특정 매장 조회 성공 - 200 OK")
    void getStore_Success() throws Exception {
        // given
        StoreResponse response = createStoreResponse("내 매장", StoreStatus.DRAFT, OWNER_ID);
        given(storeService.getStore(OWNER_ID, STORE_ID)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}", STORE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(STORE_ID));
    }

    @Test
    @DisplayName("특정 매장 조회 실패 - 찾을 수 없음 - 404 Not Found")
    void getStore_Fail_NotFound() throws Exception {
        // given
        given(storeService.getStore(OWNER_ID, STORE_ID))
                .willThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}", STORE_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("매장 수정 성공 - 200 OK")
    void updateStore_Success() throws Exception {
        // given
        StoreUpdateRequest request =
                new StoreUpdateRequest("수정된 매장", "새 주소", "02-4567-8901", "카페 설명", null);
        StoreResponse response = createStoreResponse("수정된 매장", StoreStatus.DRAFT, OWNER_ID);
        given(storeService.updateStore(anyLong(), anyLong(), any(StoreUpdateRequest.class), any()))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        multipart(HttpMethod.PUT, "/api/owner/stores/{storeId}", STORE_ID)
                                .part(jsonPart("data", request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("수정된 매장"));
    }

    @Test
    @DisplayName("매장 수정 실패 - 유효성 검증 실패 - 400 Bad Request")
    void updateStore_Fail_InvalidRequest() throws Exception {
        // given
        StoreUpdateRequest request = new StoreUpdateRequest("", "새 주소", "02-4567-8901", null, null);

        // when & then
        mockMvc.perform(
                        multipart(HttpMethod.PUT, "/api/owner/stores/{storeId}", STORE_ID)
                                .part(jsonPart("data", request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("매장 삭제 성공 - 204 No Content")
    void deleteStore_Success() throws Exception {
        // given
        doNothing().when(storeService).deleteStore(OWNER_ID, STORE_ID);

        // when & then
        mockMvc.perform(delete("/api/owner/stores/{storeId}", STORE_ID))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("매장 삭제 실패 - 찾을 수 없음 - 404 Not Found")
    void deleteStore_Fail_NotFound() throws Exception {
        // given
        doThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND))
                .when(storeService)
                .deleteStore(OWNER_ID, STORE_ID);

        // when & then
        mockMvc.perform(delete("/api/owner/stores/{storeId}", STORE_ID))
                .andExpect(status().isNotFound());
    }
}
