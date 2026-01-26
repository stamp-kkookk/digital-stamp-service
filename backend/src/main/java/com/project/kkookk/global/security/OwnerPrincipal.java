package com.project.kkookk.global.security;

import java.util.Collection;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class OwnerPrincipal implements UserDetails {

    private final Long ownerId;
    private final String email;
    private final Collection<? extends GrantedAuthority> authorities;

    @Builder
    private OwnerPrincipal(Long ownerId, String email) {
        this.ownerId = ownerId;
        this.email = email;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_OWNER"));
    }

    public static OwnerPrincipal of(Long ownerId, String email) {
        return OwnerPrincipal.builder().ownerId(ownerId).email(email).build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
