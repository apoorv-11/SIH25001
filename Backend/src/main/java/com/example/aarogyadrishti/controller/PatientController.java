package com.example.aarogyadrishti.controller;


import com.example.aarogyadrishti.model.Patient;
import com.example.aarogyadrishti.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin // Allows our React frontend to call these APIs
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/{patientId}")
    public ResponseEntity<Patient> getPatientById(@PathVariable String patientId) {
        return patientRepository.findById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}