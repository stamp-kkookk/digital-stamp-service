package com.project.kkookk.owner.controller.config;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockOwnerSecurityContextFactory.class)
public @interface WithMockOwner {

    long ownerId() default 1L;

    String email() default "owner@example.com";
}
