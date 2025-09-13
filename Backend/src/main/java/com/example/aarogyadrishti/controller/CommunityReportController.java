package com.example.aarogyadrishti.controller;

import com.example.aarogyadrishti.model.CommunityReport;
import com.example.aarogyadrishti.repository.CommunityReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/report")
@CrossOrigin
public class CommunityReportController {

    @Autowired
    private CommunityReportRepository reportRepository;

    @PostMapping("/case")
    public CommunityReport createReport(@RequestBody CommunityReport report) {
        report.setReportDate(LocalDate.now()); // Set the current date on submission
        return reportRepository.save(report);
    }
}