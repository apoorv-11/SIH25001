package com.example.aarogyadrishti.config;

import com.example.aarogyadrishti.model.CommunityReport;
import com.example.aarogyadrishti.model.Patient;
import com.example.aarogyadrishti.repository.CommunityReportRepository;
import com.example.aarogyadrishti.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    // Spring can directly use constructor injection without explicit @Autowired here
    private final PatientRepository patientRepository;
    private final CommunityReportRepository reportRepository;

    public DataInitializer(PatientRepository patientRepository, CommunityReportRepository reportRepository) {
        this.patientRepository = patientRepository;
        this.reportRepository = reportRepository;
    }

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            System.out.println("Preloading mock data...");

            // Create a mock patient with a String ID
            Patient patient1 = new Patient();
            patient1.setPatientId("PAT101"); // Using a string ID for testing
            patient1.setName("Ramesh Kumar");
            patient1.setMedicalHistory("Patient has a history of Type 2 Diabetes diagnosed in 2015. " +
                    "Underwent an appendectomy in 2018. Allergic to penicillin.");
            patientRepository.save(patient1);

            // Create mock reports
            CommunityReport report1 = new CommunityReport();
            report1.setDisease("Dengue");
            report1.setLocation("Sector 14, Rewari");
            report1.setCaseCount(8);
            report1.setReportDate(LocalDate.now().minusDays(2));
            reportRepository.save(report1);

            CommunityReport report2 = new CommunityReport();
            report2.setDisease("Typhoid");
            report2.setLocation("Model Town, Rewari");
            report2.setCaseCount(3);
            report2.setReportDate(LocalDate.now().minusDays(1));
            reportRepository.save(report2);

            System.out.println("Mock data preloaded successfully.");
        };
    }
}
