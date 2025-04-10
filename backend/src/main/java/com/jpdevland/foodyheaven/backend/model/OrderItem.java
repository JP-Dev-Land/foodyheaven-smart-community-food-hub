package com.jpdevland.foodyheaven.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false) // Reference the actual FoodItem
    private FoodItem foodItem;

    @Column(nullable = false)
    private Integer quantity;

    // Store price at the time of order to avoid issues if FoodItem price changes
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtOrderTime;

    // Optional: Store name in case FoodItem name changes
    @Column(nullable = false)
    private String foodItemNameAtOrderTime;

}