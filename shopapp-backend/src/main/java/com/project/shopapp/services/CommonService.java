package com.project.shopapp.services;

import com.project.shopapp.models.Availability;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommonService {

    /**
     * Parse availability string to Availability enum. Default to IN_STOCK for null/invalid values.
     */
    public Availability parseAvailability(String availability) {
        if (availability == null || availability.isBlank()) {
            return Availability.IN_STOCK;
        }
        try {
            return Availability.valueOf(availability.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return Availability.IN_STOCK;
        }
    }

}
