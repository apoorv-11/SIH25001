package com.example.aarogyadrishti.controller;

import com.example.aarogyadrishti.repository.CommunityReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin // Allow the React frontend to call these endpoints
public class DashboardController {

    private final CommunityReportRepository reportRepository;

    @Autowired
    public DashboardController(CommunityReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    /**
     * This endpoint calculates the total number of cases for each location
     * from the submitted community reports.
     * @return A Map where the key is the location and the value is the total case count.
     */
    @GetMapping("/hotspots")
    public Map<String, Long> getHotspots() {
        return reportRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        report -> report.getLocation(),
                        Collectors.summingLong(report -> report.getCaseCount())
                ));
    }

    /**
     * This is a placeholder endpoint for IoT water quality data.
     * In a real application, this would fetch data from an IoT device or a time-series database.
     * @param location The location for which to get water data.
     * @return A Map containing mock water quality data.
     */
    @GetMapping("/iot-water-data/{location}")
    public Map<String, Double> getWaterData(@PathVariable String location) {
        // Return mock data for demonstration purposes
        // In a real system, you would query a different service or database here.
        System.out.println("Fetching water data for: " + location);
        return Map.of(
            "pH", 7.2,
            "Turbidity", 3.5,
            "Contaminants", 15.0
        );
    }
}
