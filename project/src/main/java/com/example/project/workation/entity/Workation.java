package com.example.project.workation.entity;

import com.example.project.workation.util.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "workations")
public class Workation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDate start;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(length = 500)
    private String reason;

    private String approverName;

    private Integer workingDays;

    private LocalDate createdAt;

    @Column(nullable = false)
    private String risk;
}
