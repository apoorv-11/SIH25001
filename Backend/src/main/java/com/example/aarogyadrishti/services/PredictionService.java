package com.example.aarogyadrishti.services;

import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    // Using Map.ofEntries for better readability with many rules
    private static final Map<String, String> symptomRules = Map.ofEntries(
        Map.entry("fever,headache,rash", "Probable Measles"),
        Map.entry("fever,headache,vomiting", "Probable Typhoid"),
        Map.entry("fever,joint pain,rash", "Probable Dengue"),
        Map.entry("fever,chills,sweating", "Probable Malaria"),
        Map.entry("cough,fever,sore throat", "Probable Influenza"),
        // The key rule you are testing:
        Map.entry("fever,rash", "Possible Measles or Dengue (More tests needed)"),
        Map.entry("headache,vomiting", "Possible Migraine or Typhoid (Check for fever)"),
        Map.entry("chills,fever", "Possible Malaria or Flu (Check other symptoms)")
    );

    public String predictDisease(List<String> symptoms) {
        // Step 1: Normalize the symptoms received from the frontend.
        // This converts everything to lowercase and removes any leading/trailing whitespace.
        List<String> normalizedSymptoms = symptoms.stream()
                                                  .map(String::toLowerCase)
                                                  .map(String::trim)
                                                  .collect(Collectors.toList());
        
        // Step 2: Sort the symptoms alphabetically.
        // This ensures that ["fever", "rash"] and ["rash", "fever"] produce the same key.
        Collections.sort(normalizedSymptoms);

        // Step 3: Join the sorted list into a single comma-separated string.
        String symptomKey = String.join(",", normalizedSymptoms);

        // --- THIS IS THE MOST IMPORTANT DEBUGGING STEP ---
        // Print the final generated key to the backend console.
        System.out.println("--- AI PREDICTION DEBUG ---");
        System.out.println("Received Raw Symptoms: " + symptoms);
        System.out.println("Normalized & Sorted Symptoms: " + normalizedSymptoms);
        System.out.println("Generated Symptom Key for Map Lookup: '" + symptomKey + "'");
        System.out.println("---------------------------");

        // Step 4: Look up the key in the map and return the result or the default message.
        return symptomRules.getOrDefault(symptomKey, "Unknown - Further diagnosis needed");
    }
}
