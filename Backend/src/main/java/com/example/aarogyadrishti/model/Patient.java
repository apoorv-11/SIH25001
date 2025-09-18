package com.example.aarogyadrishti.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Data;
import java.util.List;

@Data
@Entity
public class Patient {

    @Id
    private String patientId;

    private String name;

    @Lob
    private String medicalHistory;

    /**
     * Stores a list of symptoms for this patient.
     * The @ElementCollection annotation tells JPA to treat this as a collection
     * of simple elements (Strings) and manage it in a separate table.
     */
    @ElementCollection
    private List<String> symptoms;

    public Patient() {
        // No-args constructor required by JPA/Hibernate
    }

    // No explicit getters or setters are needed.
    // Lombok's @Data annotation automatically generates all of the following at compile time:
    // - getPatientId(), setPatientId(String)
    // - getName(), setName(String)
    // - getMedicalHistory(), setMedicalHistory(String)
    // - getSymptoms(), setSymptoms(List<String>)
    // - toString(), equals(), and hashCode() methods

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

    public List<String> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<String> symptoms) {
        this.symptoms = symptoms;
    }
}
