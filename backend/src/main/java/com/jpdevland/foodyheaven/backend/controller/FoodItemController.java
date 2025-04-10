package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.CreateFoodItemRequest;
import com.jpdevland.foodyheaven.backend.dto.FoodItemDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateFoodItemRequest;
import com.jpdevland.foodyheaven.backend.service.FoodItemService;
import com.jpdevland.foodyheaven.backend.service.impl.UserDetailsImpl;
import com.jpdevland.foodyheaven.backend.service.impl.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*; // Import necessary annotations

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:5173") // Configure globally if needed
public class FoodItemController {

    private final FoodItemService foodItemService;

    // GET (Read All - Public) - No changes needed
    @GetMapping
    public ResponseEntity<List<FoodItemDTO>> getAllAvailableFoodItems() {
        List<FoodItemDTO> foodItems = foodItemService.getAllAvailableFoodItems();
        return ResponseEntity.ok(foodItems);
    }

    // GET (Read One - Public) - No changes needed
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDTO> getFoodItemById(@PathVariable Long id) {
        FoodItemDTO foodItem = foodItemService.getFoodItemById(id);
        return ResponseEntity.ok(foodItem);
    }

    // POST (Create - Requires Authentication, e.g., any logged-in user or specific role)
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Example: Any logged-in user can create. Change role if needed: "hasRole('COOK')"
    public ResponseEntity<FoodItemDTO> createFoodItem(
            @Valid @RequestBody CreateFoodItemRequest request, // Add @Valid for validation
            @AuthenticationPrincipal UserDetailsImpl currentUser) { // Get authenticated user details

        if (currentUser == null) {
            // Should ideally be handled by Spring Security filters, but as a fallback:
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Pass the authenticated user's ID to the service
        FoodItemDTO createdItem = foodItemService.createFoodItem(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem); // Return 201 Created
    }

    // PUT (Update - Requires Authentication and Ownership)
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Check if logged in first
    public ResponseEntity<FoodItemDTO> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFoodItemRequest request, // Add @Valid
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Service layer handles the ownership check using currentUser.getId()
        FoodItemDTO updatedItem = foodItemService.updateFoodItem(id, request, currentUser.getId());
        return ResponseEntity.ok(updatedItem); // Return 200 OK
    }

    // DELETE (Delete - Requires Authentication and Ownership)
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Check if logged in first
    public ResponseEntity<Void> deleteFoodItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Service layer handles the ownership check using currentUser.getId()
        foodItemService.deleteFoodItem(id, currentUser.getId());
        return ResponseEntity.noContent().build(); // Return 204 No Content
    }
}