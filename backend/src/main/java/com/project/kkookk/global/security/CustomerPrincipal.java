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
    private final String phone;
    private final Collection<? extends GrantedAuthority> authorities;

    @Builder
    private CustomerPrincipal(Long walletId, String phone) {
        this.walletId = walletId;
        this.phone = phone;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
    }

    public static CustomerPrincipal of(Long walletId, String phone) {
        return CustomerPrincipal.builder().walletId(walletId).phone(phone).build();
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
        return phone;
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
