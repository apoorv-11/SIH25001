package com.example.aarogyadrishti.controller;

import com.example.aarogyadrishti.services.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend requests
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    // Define a simple request body class
    static class SymptomRequest {
        public List<String> symptoms;
    }

    @PostMapping("/symptoms")
    public Map<String, String> predictFromSymptoms(@RequestBody SymptomRequest request) {
        String prediction = predictionService.predictDisease(request.symptoms);
        // Return a simple map with the prediction
        return Map.of("prediction", prediction);
    }
}
