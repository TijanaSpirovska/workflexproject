package com.example.project.workation.api;

import com.example.project.workation.entity.Workation;
import com.example.project.workation.service.WorkationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/workflex")
public class WorkationController {

    private final WorkationService service;

    public WorkationController(WorkationService service) {
        this.service = service;
    }

    @GetMapping("/workation")
    public List<Workation> getAllWorkations(
            @RequestParam(defaultValue = "employeeName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return service.getSortedWorkations(sortBy, direction);
    }


    @PostMapping("/workation/upload")
    public String uploadWorkations(@RequestParam("file") MultipartFile file) {
        try {
            service.uploadCsv(file);
            return "CSV uploaded successfully!";
        } catch (Exception e) {
            return "Error uploading CSV: " + e.getMessage();
        }
    }
}
