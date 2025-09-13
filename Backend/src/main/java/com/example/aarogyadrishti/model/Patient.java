package com.example.aarogyadrishti.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Data;

@Data
@Entity
public class Patient {

    @Id
    private String patientId; // Use String ID without @GeneratedValue

    private String name;

    @Lob
    private String medicalHistory;

    public Patient() {
        // No-args constructor required by JPA/Hibernate
    }

    // Lombok's @Data annotation will automatically generate:
    // getPatientId(), setPatientId(String), getName(), setName(String), etc.

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }
}
