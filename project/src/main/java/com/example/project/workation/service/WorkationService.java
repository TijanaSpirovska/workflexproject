package com.example.project.workation.service;

import com.example.project.workation.entity.Workation;
import com.example.project.workation.repository.WorkationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class WorkationService {

    private final WorkationRepository repository;

    // Supported date formats
    private final List<DateTimeFormatter> dateFormatters = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    );

    public WorkationService(WorkationRepository repository) {
        this.repository = repository;
    }

    /** Retrieve sorted workations */
    public List<Workation> getSortedWorkations(String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return repository.findAll(sort);
    }

    /** Upload and parse CSV */
    public void uploadCsv(MultipartFile file) throws Exception {
        List<Workation> workations = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                // Skip header row
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                // Parse line safely
                String[] data = parseCsvLine(line);

                Workation workation = new Workation();
                workation.setId(UUID.randomUUID());
                workation.setEmployeeName(data[0]);
                workation.setOrigin(data[1]);
                workation.setDestination(data[2]);
                workation.setStart(parseDate(data[3]));
                workation.setEndDate(parseDate(data[4]));
                workation.setWorkingDays(Integer.parseInt(data[5]));
                workation.setRisk(data[6]);
                workation.setCreatedAt(LocalDate.now());

                workations.add(workation);
            }
        }

        repository.saveAll(workations);
    }

    /** Parse CSV line respecting quotes and commas */
    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        boolean insideQuote = false;
        StringBuilder current = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '"') {
                insideQuote = !insideQuote;
            } else if (c == ',' && !insideQuote) {
                tokens.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        tokens.add(current.toString().trim());
        return tokens.toArray(new String[0]);
    }

    /** Try parsing date with multiple formats */
    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter formatter : dateFormatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ignored) {
            }
        }
        throw new RuntimeException("Invalid date format: " + dateStr);
    }
}
