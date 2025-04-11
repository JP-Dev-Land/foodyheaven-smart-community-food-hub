package com.jpdevland.foodyheaven.backend.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Embeddable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coordinates {
    @NotNull(message = "Latitude is required")
    private double latitude;
    @NotNull(message = "Longitude is required")
    private double longitude;
    private String street;
    private String city;
    private String postalCode;
}