package com.project.kkookk.global.logging;

import org.slf4j.MDC;

public final class FlowMdc {

    private static final String FLOW_TYPE = "flowType";
    private static final String FLOW_ID = "flowId";

    private FlowMdc() {}

    public static void setIssuanceFlow(Long issuanceRequestId) {
        MDC.put(FLOW_TYPE, "ISSUANCE");
        MDC.put(FLOW_ID, String.valueOf(issuanceRequestId));
    }

    public static void setRedeemFlow(Long redeemSessionId) {
        MDC.put(FLOW_TYPE, "REDEEM");
        MDC.put(FLOW_ID, String.valueOf(redeemSessionId));
    }

    public static void setMigrationFlow(Long migrationRequestId) {
        MDC.put(FLOW_TYPE, "MIGRATION");
        MDC.put(FLOW_ID, String.valueOf(migrationRequestId));
    }

    public static void clear() {
        MDC.remove(FLOW_TYPE);
        MDC.remove(FLOW_ID);
    }
}
