package com.project.kkookk.owner.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "owner_account")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OwnerAccount extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String nickname;

    private String phoneNumber;

    @Column(nullable = false)
    private boolean admin;

    @Builder
    private OwnerAccount(
            String email, String passwordHash, String name, String nickname, String phoneNumber) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.admin = false;
    }
}
