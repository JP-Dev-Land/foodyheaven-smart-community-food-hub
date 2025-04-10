package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.dto.CreateFoodItemRequest;
import com.jpdevland.foodyheaven.backend.dto.FoodItemDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateFoodItemRequest;
import com.jpdevland.foodyheaven.backend.exception.ResourceNotFoundException;
import com.jpdevland.foodyheaven.backend.exception.UnauthorizedAccessException;
import com.jpdevland.foodyheaven.backend.model.FoodItem;
import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.FoodItemRepository;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodItemServiceImpl implements FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository; // Inject UserRepository

    @Override
    @Transactional(readOnly = true)
    public List<FoodItemDTO> getAllAvailableFoodItems() {
        return foodItemRepository.findByAvailableTrue().stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FoodItemDTO getFoodItemById(Long id) {
        FoodItem foodItem = findFoodItemOrThrow(id);
        return mapEntityToDTO(foodItem);
    }

    @Override
    @Transactional // Not read-only
    public FoodItemDTO createFoodItem(CreateFoodItemRequest request, Long cookId) {
        User cook = userRepository.findById(cookId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", cookId));

        FoodItem newItem = new FoodItem();
        newItem.setCook(cook);
        newItem.setName(request.getName());
        newItem.setDescription(request.getDescription());
        newItem.setPrice(request.getPrice());
        newItem.setImageUrl(request.getImageUrl());
        newItem.setTags(request.getTags()); // Assumes tags are directly usable
        newItem.setAvailable(request.isAvailable());
        // Timestamps are set automatically by annotations

        FoodItem savedItem = foodItemRepository.save(newItem);
        return mapEntityToDTO(savedItem);
    }

    @Override
    @Transactional
    public FoodItemDTO updateFoodItem(Long id, UpdateFoodItemRequest request, Long requestingUserId) {
        FoodItem existingItem = findFoodItemOrThrow(id);

        // --- Authorization Check ---
        if (!existingItem.getCook().getId().equals(requestingUserId)) {
            throw new UnauthorizedAccessException("User not authorized to update this food item");
        }

        // Update fields
        existingItem.setName(request.getName());
        existingItem.setDescription(request.getDescription());
        existingItem.setPrice(request.getPrice());
        existingItem.setImageUrl(request.getImageUrl());
        existingItem.setTags(request.getTags());
        existingItem.setAvailable(request.getAvailable());
        // updatedAt is updated automatically

        FoodItem updatedItem = foodItemRepository.save(existingItem);
        return mapEntityToDTO(updatedItem);
    }

    @Override
    @Transactional
    public void deleteFoodItem(Long id, Long requestingUserId) {
        FoodItem itemToDelete = findFoodItemOrThrow(id);

        // --- Authorization Check ---
        if (!itemToDelete.getCook().getId().equals(requestingUserId)) {
            throw new UnauthorizedAccessException("User not authorized to delete this food item");
        }

        foodItemRepository.delete(itemToDelete);
    }

    // --- Helper method to find item or throw ---
    private FoodItem findFoodItemOrThrow(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", "id", id));
    }

    // --- Helper method for mapping ---
    private FoodItemDTO mapEntityToDTO(FoodItem entity) {
        return new FoodItemDTO(
                entity.getId(),
                entity.getCook().getId(), // Cook should not be null here due to constraints
                entity.getCook().getName(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getImageUrl(),
                entity.getTags(),
                entity.isAvailable(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
