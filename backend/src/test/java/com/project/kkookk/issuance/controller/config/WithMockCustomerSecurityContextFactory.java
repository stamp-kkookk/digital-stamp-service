package com.project.kkookk.issuance.controller.config;

import com.project.kkookk.global.security.CustomerPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockCustomerSecurityContextFactory
        implements WithSecurityContextFactory<WithMockCustomer> {

    @Override
    public SecurityContext createSecurityContext(WithMockCustomer annotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        CustomerPrincipal principal =
                CustomerPrincipal.of(annotation.walletId(), annotation.phone());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        principal, principal.getPassword(), principal.getAuthorities());

        context.setAuthentication(authentication);
        return context;
    }
}
