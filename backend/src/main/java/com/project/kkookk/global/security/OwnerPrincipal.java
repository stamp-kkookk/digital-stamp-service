package com.project.kkookk.global.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class OwnerPrincipal implements UserDetails {

    private final Long ownerId;
    private final String email;
    private final boolean isAdmin;
    private final Collection<? extends GrantedAuthority> authorities;

    private OwnerPrincipal(Long ownerId, String email, boolean isAdmin) {
        this.ownerId = ownerId;
        this.email = email;
        this.isAdmin = isAdmin;

        List<GrantedAuthority> auths = new ArrayList<>();
        auths.add(new SimpleGrantedAuthority("ROLE_OWNER"));
        if (isAdmin) {
            auths.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        this.authorities = List.copyOf(auths);
    }

    public static OwnerPrincipal of(Long ownerId, String email) {
        return new OwnerPrincipal(ownerId, email, false);
    }

    public static OwnerPrincipal of(Long ownerId, String email, boolean isAdmin) {
        return new OwnerPrincipal(ownerId, email, isAdmin);
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
