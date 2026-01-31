package com.project.kkookk.issuance.controller.config;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockCustomerSecurityContextFactory.class)
public @interface WithMockCustomer {

    long walletId() default 1L;

    String phone() default "010-1234-5678";
}
