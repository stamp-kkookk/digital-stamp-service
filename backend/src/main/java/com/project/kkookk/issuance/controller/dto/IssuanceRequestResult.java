package com.project.kkookk.issuance.controller.dto;

/** 적립 요청 생성 결과를 담는 record (201 vs 200 구분용) */
public record IssuanceRequestResult(IssuanceRequestResponse response, boolean newlyCreated) {}
