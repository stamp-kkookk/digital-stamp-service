package com.project.kkookk.stamp.repository;

import com.project.kkookk.stamp.domain.StampEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StampEventRepository extends JpaRepository<StampEvent, Long> {}
