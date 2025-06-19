package org.ost.investigate.springboot.examples.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate; // Changed from LocalDateTime to LocalDate

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFilter {
    private String nameFilter; // Renamed from 'username' to 'nameFilter' to match frontend

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // Changed to ISO.DATE for date input
    private LocalDate createdAtStart;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // Changed to ISO.DATE for date input
    private LocalDate createdAtEnd;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // Added for updated_at date range filtering
    private LocalDate updatedAtStart;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // Added for updated_at date range filtering
    private LocalDate updatedAtEnd;

    private Long startId;
    private Long endId;
}
