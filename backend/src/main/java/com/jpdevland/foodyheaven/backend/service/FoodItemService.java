package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.CreateFoodItemRequest;
import com.jpdevland.foodyheaven.backend.dto.FoodItemDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateFoodItemRequest;

import java.util.List;

public interface FoodItemService {
    List<FoodItemDTO> getAllAvailableFoodItems();
    FoodItemDTO getFoodItemById(Long id);
    // Use logged-in user's ID for creation and authorization
    FoodItemDTO createFoodItem(CreateFoodItemRequest request, Long cookId);
    FoodItemDTO updateFoodItem(Long id, UpdateFoodItemRequest request, Long requestingUserId);
    void deleteFoodItem(Long id, Long requestingUserId);
}
