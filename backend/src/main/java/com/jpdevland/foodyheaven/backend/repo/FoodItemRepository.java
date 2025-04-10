package com.jpdevland.foodyheaven.backend.repo;

import com.jpdevland.foodyheaven.backend.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    // Find all available food items
    List<FoodItem> findByAvailableTrue();

    // Find food items by a specific cook
     List<FoodItem> findByCookIdAndAvailableTrue(Long cookId);
}