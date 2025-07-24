package com.example.project.service;


import com.example.project.workation.entity.Workation;
import com.example.project.workation.repository.WorkationRepository;
import com.example.project.workation.service.WorkationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class WorkationServiceIntegrationTest {

    @Autowired
    private WorkationRepository repository;

    @Test
    void testUploadCsv_savesWorkationsInDb() throws Exception {
        WorkationService service = new WorkationService(repository);

        String csvData =
                "employeeName,origin,destination,start,endDate,workingDays,risk\n" +
                        "John Doe,Germany,United States,2023-04-01,2023-04-10,9,HIGH_RISK";

        MockMultipartFile file = new MockMultipartFile(
                "file", "workations.csv", "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        service.uploadCsv(file);

        List<Workation> workations = repository.findAll();
        assertEquals(1, workations.size());
        assertEquals("John Doe", workations.get(0).getEmployeeName());
    }
}
