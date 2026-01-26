package com.project.kkookk.owner.controller.config;

import com.project.kkookk.global.security.OwnerPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockOwnerSecurityContextFactory
        implements WithSecurityContextFactory<WithMockOwner> {

    @Override
    public SecurityContext createSecurityContext(WithMockOwner annotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        OwnerPrincipal principal = OwnerPrincipal.of(annotation.ownerId(), annotation.email());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        principal, principal.getPassword(), principal.getAuthorities());

        context.setAuthentication(authentication);
        return context;
    }
}
