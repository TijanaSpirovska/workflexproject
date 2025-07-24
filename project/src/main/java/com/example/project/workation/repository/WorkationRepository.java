package com.example.project.workation.repository;


import com.example.project.workation.entity.Workation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkationRepository extends JpaRepository<Workation, UUID> {
}
