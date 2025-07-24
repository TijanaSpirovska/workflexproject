package com.example.project.workation.dto;

import com.example.project.workation.util.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkationDto {

    private UUID id;
    private String employeeName;
    private String origin;
    private String destination;
    private LocalDate start;
    private LocalDate endDate;
    private Status status;
    private String reason;
    private String approverName;
    private Integer workingDays;
    private LocalDate createdAt;
    private String risk;
}
