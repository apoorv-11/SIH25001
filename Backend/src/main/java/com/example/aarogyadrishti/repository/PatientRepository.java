package com.example.aarogyadrishti.repository;

import com.example.aarogyadrishti.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

// The second generic type MUST be the type of the ID field in the Patient entity.
public interface PatientRepository extends JpaRepository<Patient, String> {
}
