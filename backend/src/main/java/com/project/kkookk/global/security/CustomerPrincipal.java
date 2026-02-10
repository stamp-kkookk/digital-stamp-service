package com.project.kkookk.global.security;

import java.util.Collection;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class CustomerPrincipal implements UserDetails {

    private final Long walletId;
    private final boolean stepUp;
    private final Collection<? extends GrantedAuthority> authorities;

    @Builder
    private CustomerPrincipal(Long walletId, boolean stepUp) {
        this.walletId = walletId;
        this.stepUp = stepUp;
        this.authorities =
                stepUp
                        ? List.of(
                                new SimpleGrantedAuthority("ROLE_CUSTOMER"),
                                new SimpleGrantedAuthority("ROLE_STEPUP"))
                        : List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
    }

    public static CustomerPrincipal of(Long walletId, boolean stepUp) {
        return CustomerPrincipal.builder().walletId(walletId).stepUp(stepUp).build();
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
        return String.valueOf(walletId);
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
