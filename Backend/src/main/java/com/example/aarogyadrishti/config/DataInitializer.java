package com.example.aarogyadrishti.config;

import com.example.aarogyadrishti.model.CommunityReport;
import com.example.aarogyadrishti.model.Patient;
import com.example.aarogyadrishti.repository.CommunityReportRepository;
import com.example.aarogyadrishti.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDate;
import java.util.List; // Import the List class

@Configuration
public class DataInitializer {

    // Spring's constructor injection works perfectly here
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

            // Clear previous mock data to ensure a clean state on each startup
            patientRepository.deleteAll();
            reportRepository.deleteAll();

            // --- Create Mock Patients with Symptoms ---

            // Patient 1
            Patient patient1 = new Patient();
            patient1.setPatientId("PAT101");
            patient1.setName("Ramesh Kumar");
            patient1.setMedicalHistory("Patient has a history of Type 2 Diabetes. Allergic to penicillin.");
            patient1.setSymptoms(List.of("fever", "rash", "headache", "joint_pain")); // Dengue-like symptoms

            // Patient 2
            Patient patient2 = new Patient();
            patient2.setPatientId("PAT102");
            patient2.setName("Priya Sharma");
            patient2.setMedicalHistory("No significant prior medical history.");
            patient2.setSymptoms(List.of("fever", "cough", "sore_throat")); // Viral fever/cold symptoms

            // Patient 3
            Patient patient3 = new Patient();
            patient3.setPatientId("PAT103");
            patient3.setName("Anil Yadav");
            patient3.setMedicalHistory("Patient reports feeling weak for the last two days.");
            patient3.setSymptoms(List.of("fever", "headache", "stomach_pain")); // Typhoid-like symptoms

            // Save all patients in a single, efficient operation
            patientRepository.saveAll(List.of(patient1, patient2, patient3));

            // --- Create Mock Community Reports ---
            CommunityReport report1 = new CommunityReport();
            report1.setDisease("Dengue");
            report1.setLocation("Sector 14, Rewari");
            report1.setCaseCount(8);
            report1.setReportDate(LocalDate.now().minusDays(2));

            CommunityReport report2 = new CommunityReport();
            report2.setDisease("Typhoid");
            report2.setLocation("Model Town, Rewari");
            report2.setCaseCount(3);
            report2.setReportDate(LocalDate.now().minusDays(1));

            // Save all reports
            reportRepository.saveAll(List.of(report1, report2));

            System.out.println("✅ Mock data preloaded successfully.");
        };
    }
}
